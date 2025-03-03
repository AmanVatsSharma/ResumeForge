import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Resume, type ResumeContent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Download, Share2, Crown, Loader2, Paintbrush, Sparkles, Bot, Menu, X, Edit } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCustomization, type TemplateConfig } from "@/hooks/use-customization";
import { PaymentDialog } from "@/components/payment-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportDialog } from "@/components/export-dialog";
import { ShareDialog } from "@/components/share-dialog";
import { TemplateCustomizationPanel } from "@/components/template-customization-panel";
import { getDefaultTemplateConfig } from "@/lib/template-utils";
import { AIToolsPanel } from "@/components/ai-tools-panel";
import { AIAssistantSidebar } from "@/components/ai-assistant-adapters";
import { 
  getTemplateComponent, 
  getTemplateName, 
  isTemplatePremium, 
  getTemplatePrice,
  templateRegistry,
  type TemplateId
} from "@/components/templates";
import { PremiumTemplateBanner } from "@/components/premium-template-banner";
import { PreviewPremiumDialog } from "@/components/preview-premium-dialog";
import { usePreviewHistory } from "@/hooks/use-preview-history";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ResumePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isAIToolsOpen, setIsAIToolsOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  // Preview history tracking
  const { 
    hasPreviewedTemplate, 
    markTemplateAsPreviewed 
  } = usePreviewHistory(id);
  
  // Template customization state
  const { 
    config, 
    updateConfig, 
    resetToDefaults,
    saveConfig,
    isSaving
  } = useCustomization(id, id);
  
  // Fetch resume data
  const { data: resume, isLoading, error } = useQuery<Resume>({
    queryKey: ["resume", id],
    queryFn: async () => {
      try {
        // Ensure the id is being properly handled - make sure it's an integer string
        const numericId = Number(id);
        if (isNaN(numericId)) {
          throw new Error("Invalid resume ID format");
        }
        const response = await apiRequest("GET", `/api/resumes/${id}`);
        return await response.json();
      } catch (error) {
        console.error("Error fetching resume:", error);
        toast({
          title: "Error loading resume",
          description: error instanceof Error ? error.message : "Failed to load resume",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!id && !!user,
  });
  
  // Display error state - moved after the useQuery hook to fix the initialization error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading resume",
        description: error instanceof Error ? error.message : "Failed to load resume data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Close mobile menu when changing pages or sections
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [id]);
  
  // Update resume template mutation
  const updateTemplate = useMutation({
    mutationFn: (templateId: string) => 
      apiRequest("PATCH", `/api/resumes/${id}/template`, {
        templateId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume", id] });
      setPendingTemplateId(null);
      toast({
        title: "Template updated",
        description: "Your resume template has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating template",
        description: error.message || "Failed to update resume template.",
        variant: "destructive",
      });
    },
  });

  const handleTemplateChange = (templateId: TemplateId) => {
    // Check if template is premium
    if (isTemplatePremium(templateId)) {
      // If user is premium, allow them to use it
      if (user?.isPremium) {
        updateTemplate.mutate(templateId);
        return;
      }
      
      // If user hasn't previewed this template yet, show preview dialog
      if (!hasPreviewedTemplate(templateId)) {
        setPendingTemplateId(templateId);
        setShowPreviewDialog(true);
        return;
      }
      
      // If user has already previewed this template, show payment dialog
      setPendingTemplateId(templateId);
      setShowPaymentDialog(true);
      return;
    }
    
    // For non-premium templates, just update directly
    updateTemplate.mutate(templateId);
  };
  
  // Handle premium template preview confirmation
  const handlePreviewConfirm = () => {
    if (pendingTemplateId) {
      // Mark template as previewed
      markTemplateAsPreviewed(pendingTemplateId);
      
      // Update the template
      updateTemplate.mutate(pendingTemplateId);
    }
  };
  
  // Handle upgrade
  const handleUpgradeClick = () => {
    setShowPaymentDialog(true);
  };
  
  // Update resume content mutation
  const updateResumeContent = useMutation({
    mutationFn: (data: {content: ResumeContent}) => 
      apiRequest("PATCH", `/api/resumes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume", id] });
      toast({
        title: "Resume updated",
        description: "Your resume has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating resume",
        description: error.message || "Failed to update resume content.",
        variant: "destructive",
      });
    },
  });
  
  // Handle resume content updates from AI tools
  const handleResumeContentUpdate = (updatedContent: ResumeContent) => {
    if (!resume) return;
    
    // Save changes to the backend
    updateResumeContent.mutate({
      content: updatedContent
    });
    
    // Show success toast
    toast({
      title: "Resume updated",
      description: "Your resume has been updated with AI-generated content",
    });
  };
  
  // Handle section updates
  const handleSectionUpdate = (section: keyof ResumeContent, content: string) => {
    if (!resume) return;
    handleResumeContentUpdate({ ...resume.content, [section]: content } as ResumeContent);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-full px-4 py-4 md:py-8">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-48" />
              </div>
        <Skeleton className="h-[500px] md:h-[800px] w-full" />
      </div>
    );
  }

  // Handle case when resume not found
  if (!resume) {
    return (
      <div className="container max-w-full px-4 py-4 md:py-8">
        <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Resume Not Found</h1>
          <p className="mb-4">The resume you are looking for does not exist or you don't have permission to view it.</p>
          <p className="mb-6 text-gray-500">Resume ID: {id}</p>
          <Link href="/">
            <Button>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
        </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get the current template component
  const TemplateComponent = getTemplateComponent(resume.templateId);
  
  // Check if the current template is premium
  const isCurrentTemplatePremium = isTemplatePremium(resume.templateId);
  const isPremiumUser = user?.isPremium || false;
  const showPremiumBanner = isCurrentTemplatePremium && !isPremiumUser;

  return (
    <div className="container max-w-full px-4 py-4 md:py-8">
      {/* Top navigation */}
      <div className="mb-6 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/templates">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
                </Link>
          <h1 className="text-xl md:text-2xl font-bold">{resume.name}</h1>
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
              </Button>
            </div>

        {/* Action buttons for desktop */}
        <div className="hidden md:flex flex-wrap gap-2">
          {/* Template selector */}
          <div className="min-w-[200px]">
              <Select
                value={resume.templateId}
                onValueChange={(value) => handleTemplateChange(value as TemplateId)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(templateRegistry).map(([id, template]) => (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center">
                      {template.premium && !user?.isPremium && (
                        <Crown className="mr-2 h-4 w-4 text-amber-500" />
                      )}
                      {template.name}
                      {template.premium && !user?.isPremium && hasPreviewedTemplate(id) && (
                        <span className="ml-2 text-xs text-gray-500">(Previewed)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>
          </div>
              
          {/* Action buttons */}
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
          >
            <Paintbrush className="mr-2 h-4 w-4" />
            Customize
          </Button>
                
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsAIToolsOpen(!isAIToolsOpen)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Tools
          </Button>
                
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          >
            <Bot className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
                
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mb-6 bg-white rounded-lg shadow-md p-4 space-y-3 animate-in slide-in-from-top-5 duration-200">
          <div className="w-full">
            <Select
              value={resume.templateId}
              onValueChange={(value) => handleTemplateChange(value as TemplateId)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(templateRegistry).map(([id, template]) => (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center">
                      {template.premium && !user?.isPremium && (
                        <Crown className="mr-2 h-4 w-4 text-amber-500" />
                      )}
                      {template.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setIsCustomizing(!isCustomizing);
                setIsMobileMenuOpen(false);
              }}
            >
              <Paintbrush className="mr-2 h-4 w-4" />
              Customize
            </Button>
                  
            <Button 
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setIsAIToolsOpen(!isAIToolsOpen);
                setIsMobileMenuOpen(false);
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Tools
            </Button>
                  
            <Button 
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setIsAssistantOpen(!isAssistantOpen);
                setIsMobileMenuOpen(false);
              }}
            >
              <Bot className="mr-2 h-4 w-4" />
              AI Assistant
            </Button>
                  
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setShowExportDialog(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      )}
      
      {/* Main content area - Resume and editing panel */}
      <div className="flex flex-1 flex-col lg:flex-row gap-4 relative">
        <div className="flex-1 min-w-0 overflow-auto">
          {/* Premium template banner */}
          {showPremiumBanner && (
            <PremiumTemplateBanner 
              templateName={getTemplateName(resume.templateId)} 
              onUpgrade={handleUpgradeClick}
            />
          )}
          
          {isCustomizing ? (
            /* Customization view with preview and controls */
            <div className="grid md:grid-cols-[350px_1fr] gap-4 animate-in fade-in duration-300">
              {/* Customization panel */}
              <TemplateCustomizationPanel
                config={config}
                updateConfig={updateConfig}
                saveConfig={saveConfig}
                isSaving={isSaving}
                isPremium={user?.isPremium || false}
                resetToDefaults={resetToDefaults}
              />
              
              {/* Preview panel */}
              <div className="flex-1 flex justify-center">
                <div className="w-[210mm] h-auto max-h-[calc(100vh-12rem)] overflow-auto bg-white shadow-lg border rounded-md">
                  <TemplateComponent 
                    content={resume.content}
                    isPremiumUser={isPremiumUser}
                    showWatermark={showPremiumBanner}
                    {...config}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Regular resume view when not customizing */
            <div className="animate-in fade-in duration-300">
              <Card className="bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden mb-6">
                <div className="p-4 border-b bg-muted/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{resume.name}</h2>
                      <p className="text-sm text-muted-foreground">Last updated: {new Date(resume.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => setIsCustomizing(true)}
                      >
                        <Paintbrush className="mr-2 h-4 w-4" />
                        Customize Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          // Navigate to generator page with resume ID for editing
                          window.location.href = `/generator?resumeId=${resume.id}&edit=true`;
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Content
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-0 overflow-auto max-h-[calc(100vh-16rem)]">
                  <div className="mx-auto max-w-4xl p-4">
                    <TemplateComponent 
                      content={resume.content}
                      isPremiumUser={isPremiumUser}
                      showWatermark={showPremiumBanner}
                      {...config}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Free user callout with improved design */}
              {!user?.isPremium && (
                <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-lg">Upgrade to Premium Template Features</h3>
                        <p className="text-sm text-muted-foreground">Access all premium templates, custom colors, and advanced styling options</p>
                      </div>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => setShowPaymentDialog(true)}
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
          
        {/* Right sidebar - AI tools (full width on mobile, fixed width on desktop) */}
        {isAIToolsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full md:w-96 h-full bg-background p-4 overflow-auto shadow-lg animate-in slide-in-from-right-10 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">AI Tools</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsAIToolsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <AIToolsPanel 
                resumeContent={resume.content} 
                onContentUpdate={handleResumeContentUpdate}
                onClose={() => setIsAIToolsOpen(false)}
              />
            </div>
          </div>
        )}
        
        {/* Right sidebar - AI assistant (full width on mobile) */}
        {isAssistantOpen && (
          <div className="w-full lg:w-auto animate-in fade-in duration-300">
            <AIAssistantSidebar
              resumeContent={resume.content}
              templateConfig={config}
              onApplyChanges={handleSectionUpdate}
              onClose={() => setIsAssistantOpen(false)}
            />
          </div>
        )}
      </div>
      
      {/* Sticky export button for mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-10">
        <Button
          onClick={() => setShowExportDialog(true)}
          size="lg"
          className="rounded-full shadow-lg h-12 w-12 p-0"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Floating AI buttons for desktop */}
      <div className="hidden md:flex fixed bottom-4 right-4 flex-col gap-3 z-10">
        <Button
          onClick={() => setIsAIToolsOpen(true)}
          size="lg"
          className="rounded-full shadow-lg h-12 w-12 p-0 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          title="AI Tools"
        >
          <Sparkles className="h-5 w-5 text-white" />
        </Button>
        <Button
          onClick={() => setIsAssistantOpen(true)}
          size="lg"
          className="rounded-full shadow-lg h-12 w-12 p-0 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
          title="AI Assistant"
        >
          <Bot className="h-5 w-5 text-white" />
        </Button>
      </div>
      
      {/* Dialogs */}
      {showExportDialog && (
        <ExportDialog
          resumeContent={resume.content}
          templateId={resume.templateId}
          templateConfig={config}
          onClose={() => setShowExportDialog(false)}
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          isPremiumUser={isPremiumUser}
          onUpgrade={handleUpgradeClick}
        />
      )}
      
      {showShareDialog && (
        <ShareDialog
          resumeId={resume.id.toString()}
          resumeName={resume.name}
          templateId={resume.templateId}
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          isPremiumUser={isPremiumUser}
          onUpgrade={handleUpgradeClick}
        />
      )}
      
      {showPaymentDialog && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          successCallback={() => {
            if (pendingTemplateId) {
              updateTemplate.mutate(pendingTemplateId);
            }
          }}
        />
      )}
      
      {showPreviewDialog && pendingTemplateId && (
        <PreviewPremiumDialog
          templateId={pendingTemplateId}
          open={showPreviewDialog}
          onOpenChange={setShowPreviewDialog}
          onConfirm={handlePreviewConfirm}
          onUpgrade={handleUpgradeClick}
        />
      )}

      {/* Mobile action buttons */}
      <div className="flex md:hidden mb-4 gap-2 overflow-x-auto pb-1 px-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-none"
          onClick={() => setIsCustomizing(true)}
        >
          <Paintbrush className="mr-2 h-4 w-4" />
          Customize Template
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="flex-none"
          onClick={() => {
            // Navigate to generator page with resume ID for editing
            window.location.href = `/generator?resumeId=${resume.id}&edit=true`;
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Content
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-none"
          onClick={() => setShowExportDialog(true)}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-none"
          onClick={() => setShowShareDialog(true)}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Mobile menu dropdown */}
      <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link to="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to My Resumes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            setIsMobileMenuOpen(false);
            setIsCustomizing(true);
          }}>
            <Paintbrush className="mr-2 h-4 w-4" />
            Customize Template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setIsMobileMenuOpen(false);
            window.location.href = `/generator?resumeId=${resume.id}&edit=true`;
          }}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Content
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setIsMobileMenuOpen(false);
            setShowExportDialog(true);
          }}>
            <Download className="mr-2 h-4 w-4" />
            Export Resume
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setIsMobileMenuOpen(false);
            setShowShareDialog(true);
          }}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Resume
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            setIsMobileMenuOpen(false);
            setIsAIToolsOpen(true);
          }}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Tools
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setIsMobileMenuOpen(false);
            setIsAssistantOpen(true);
          }}>
            <Bot className="mr-2 h-4 w-4" />
            AI Assistant
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}