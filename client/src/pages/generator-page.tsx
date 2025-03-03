import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronLeft, Download, Wand2, Settings, Save, MessageSquare, X, Maximize2, Minimize2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertResumeSchema, type ResumeContent } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { generateContent, sendChatMessage, type GenerateContentOptions, type ChatMessage } from "@/lib/ai-service";
import { ChatPanel } from "@/components/chat-panel";
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIOptionsDialog } from "@/components/ai-options-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { analytics } from "@/lib/analytics";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { AIGeneratorAssistant } from "@/components/ai-assistant-adapters";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  HelpCircle, 
  Info, 
  Sparkles, 
  Check, 
  Lightbulb,
  FileText,
  Palette,
  Share,
  DownloadIcon
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Form data structure for the resume generator
 * @interface FormData
 * @property {string} name - The name of the resume
 * @property {ResumeContent} content - The content of the resume including personal info, experience, education, etc.
 */
type FormData = {
  name: string;
  content: ResumeContent;
  templateId?: string;
};

// Available industry options for tailoring resume content
const industryOptions = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "marketing", label: "Marketing" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "hospitality", label: "Hospitality" },
  { value: "consulting", label: "Consulting" },
  { value: "nonprofit", label: "Non-Profit" },
];

// Experience level options
const experienceOptions = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
];

// Content tone options
const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "creative", label: "Creative" },
  { value: "academic", label: "Academic" },
  { value: "technical", label: "Technical" },
  { value: "executive", label: "Executive" },
];

// Sections to display in the form
const sections = ["summary", "experience", "education", "skills"];

// Personal info fields to display
const personalInfoFields = [
  {
    name: "fullName",
    label: "Full Name",
    placeholder: "Jane Doe",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "jane@example.com",
    type: "email",
  },
  {
    name: "phone",
    label: "Phone",
    placeholder: "+1 (555) 123-4567",
    type: "tel",
  },
  {
    name: "location",
    label: "Location",
    placeholder: "New York, NY",
    type: "text",
  },
];

/**
 * Resume Generator Page
 * 
 * This component provides a form interface for users to create and edit their resume.
 * It includes AI-assisted content generation and a chat interface for resume advice.
 * 
 * @component
 * @returns {JSX.Element} The resume generator page component
 */
export default function GeneratorPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your resume assistant. How can I help you improve your resume today?",
    },
  ]);
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("personal-info");
  const formRef = useRef<HTMLFormElement>(null);
  const [activeValue, setActiveValue] = useState("");
  
  // Check if device is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // AI content generation options
  const [aiOptions, setAIOptions] = useState<GenerateContentOptions>({
    jobTitle: "",
    industry: "",
    experienceLevel: "",
    tone: "professional",
  });

  // Inside the GeneratorPage component, add this state
  const [previewMode, setPreviewMode] = useState<Record<string, boolean>>({});

  // Inside the GeneratorPage component, add state to track feature tour
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  // Add a state to track if we're in a child form submission
  const [preventFormSubmit, setPreventFormSubmit] = useState(false);

  // Add an advanced feature tour state
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [showAdvancedTour, setShowAdvancedTour] = useState(false);

  // Add constants for feature tour
  const FEATURES = [
    {
      title: "AI Content Generation",
      description: "Click the magic wand to instantly generate professional content for each section",
      icon: <Wand2 className="h-5 w-5 text-primary" />,
    },
    {
      title: "Markdown Preview",
      description: "Toggle the preview switch to see your formatted content in real-time",
      icon: <FileText className="h-5 w-5 text-primary" />,
    },
    {
      title: "AI Assistant",
      description: isMobile 
        ? "Tap the chat button to get personalized help with your resume" 
        : "Use the assistant panel for personalized help with your resume",
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
    },
    {
      title: "Customization Options",
      description: "Personalize your AI suggestions by setting your job details and preferences",
      icon: <Settings className="h-5 w-5 text-primary" />,
    },
    {
      title: "Template Selection",
      description: "Choose from multiple professional templates to showcase your skills",
      icon: <Palette className="h-5 w-5 text-primary" />,
    },
    {
      title: "Export Options",
      description: "Download your resume in multiple formats or share directly via email",
      icon: <DownloadIcon className="h-5 w-5 text-primary" />,
    },
  ];

  /**
   * Form hook for managing the resume form state
   */
  const form = useForm<FormData>({
    resolver: zodResolver(insertResumeSchema),
    defaultValues: {
      name: "My Resume",
      content: {
        personalInfo: {
          fullName: "",
          email: "",
          phone: "",
          location: "",
        },
        experience: "",
        education: "",
        skills: "",
        summary: "",
      },
      templateId: new URLSearchParams(window.location.search).get("template") || "modern-1",
    },
  });
  
  // Set active value when current section changes
  useEffect(() => {
    if (activeSection) {
      // Define a type-safe way to get section content
      const getContentForSection = (section: string): string => {
        const content = form.getValues('content');
        
        if (section === 'summary') return content.summary || '';
        if (section === 'experience') return content.experience || '';
        if (section === 'education') return content.education || '';
        if (section === 'skills') return content.skills || '';
        
        return '';
      };
      
      const currentContent = getContentForSection(activeSection);
      setActiveValue(currentContent);
    }
  }, [activeSection, form]);
  
  // Function to handle content updates from the AI assistant
  const handleSectionContentUpdate = (content: string) => {
    if (!activeSection) {
      toast({
        title: "Update failed",
        description: "No active section selected for update.",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`Updating ${activeSection} with new content:`, content);
    
    // Define a type-safe way to update section content
    const updateContentForSection = (section: string, newContent: string) => {
      if (section === 'summary') form.setValue('content.summary', newContent);
      else if (section === 'experience') form.setValue('content.experience', newContent);
      else if (section === 'education') form.setValue('content.education', newContent);
      else if (section === 'skills') form.setValue('content.skills', newContent);
    };
    
    // Update the form
    updateContentForSection(activeSection, content);
    
    // Update the active value
    setActiveValue(content);
    
    // Instead of using form.trigger with a dynamic path, we can force a form validation
    // on all fields, which is safer and avoids the TypeScript error
    form.trigger();
    
    toast({
      title: "Content Updated",
      description: `Your ${activeSection} section has been updated by the AI.`,
    });
  };

  // Set templateId when component mounts
  useEffect(() => {
    const templateId = new URLSearchParams(window.location.search).get("template") || "modern-1";
    form.setValue("templateId", templateId);
  }, [form]);

  // Get URL params
  const searchParams = new URLSearchParams(window.location.search);
  const templateParam = searchParams.get("template") || "modern-1";
  const resumeId = searchParams.get("resumeId");
  const isEditing = searchParams.get("edit") === "true" && resumeId !== null;
  
  // Set page title based on mode
  useEffect(() => {
    document.title = isEditing ? "Edit Resume | ResumeForge" : "Create Resume | ResumeForge";
  }, [isEditing]);
  
  // Fetch resume data if editing
  const { data: existingResume, isLoading: isLoadingResume } = useQuery({
    queryKey: ["resume", resumeId],
    queryFn: async () => {
      if (!isEditing || !resumeId) return null;
      const res = await apiRequest("GET", `/api/resumes/${resumeId}`);
      return await res.json();
    },
    enabled: isEditing && !!resumeId,
  });
  
  // Initialize form with existing resume data if editing
  useEffect(() => {
    if (isEditing && existingResume) {
      form.setValue("name", existingResume.name);
      form.setValue("content", existingResume.content);
      form.setValue("templateId", existingResume.templateId);
      
      if (existingResume.content) {
        // Set initial active section and value for editing
        const contentSections = ["summary", "experience", "education", "skills"];
        setActiveTab(contentSections[0]);
        setActiveSection(contentSections[0]);
        setActiveValue(existingResume.content[contentSections[0]] || "");
        
        // Set AI options based on resume content if possible
        const personalInfo = existingResume.content.personalInfo;
        if (personalInfo) {
          setAIOptions(prev => ({
            ...prev,
            jobTitle: personalInfo.position || "",
          }));
        }
      }
    }
  }, [isEditing, existingResume, form]);

  /**
   * Mutation for creating or updating a resume
   */
  const createResumeMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Ensure we have all required fields
      const templateToUse = data.templateId || templateParam;
      
      const payload = {
        name: data.name,
        content: data.content,
        templateId: templateToUse
      };
      
      // If editing, update existing resume
      if (isEditing && resumeId) {
        const res = await apiRequest("PATCH", `/api/resumes/${resumeId}`, payload);
        return await res.json();
      } else {
        // Otherwise create new resume
        const res = await apiRequest("POST", "/api/resumes", payload);
        return await res.json();
      }
    },
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: (resume) => {
      setIsSubmitting(false);
      
      // Show appropriate message
      toast({
        title: isEditing ? "Resume updated" : "Resume created",
        description: isEditing 
          ? "Your resume has been updated successfully" 
          : "Your resume has been saved successfully",
      });
      
      // Track event - only using valid analytics event types
      analytics.trackEvent({
        type: "resume_create",
        templateId: resume.templateId
      });
      
      // Navigate to the resume page
      if (resume && resume.id) {
        // Always navigate to the resume page after save/update
        setLocation(`/resume/${resume.id}`);
      } else {
        // Fallback to home page if something went wrong
        setLocation("/");
      }
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast({
        title: isEditing ? "Failed to update resume" : "Failed to create resume",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Generates content for a specific resume section using AI
   * 
   * @param {keyof Omit<ResumeContent, "personalInfo">} section - The section to generate content for
   * @returns {Promise<void>} A promise that resolves when content generation is complete
   */
  const generateWithAI = async (section: keyof Omit<ResumeContent, "personalInfo">) => {
    setIsGenerating(true);
    setActiveSection(String(section));
    try {
      const currentContent = form.getValues(`content.${section}`);
      
      // Use AI options with content generation
      const content = await generateContent(
        section as string, 
        currentContent,
        aiOptions
      );
      
      form.setValue(`content.${section}`, content);
      toast({
        title: "Content generated",
        description: `AI has generated content for your ${section} section.`,
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setActiveSection(null);
    }
  };

  /**
   * Handles sending a message to the AI chat assistant
   * 
   * @param {string} message - The message to send to the AI
   * @returns {Promise<void>} A promise that resolves when the chat process is complete
   */
  const handleChatMessage = async (message: string) => {
    if (isProcessingChat) return;
    
    setIsProcessingChat(true);
    
    // Add the user message to the chat history
    const updatedMessages = [...messages, { role: "user" as const, content: message }];
    setMessages(updatedMessages);
    
    try {
      const formContent = form.getValues();
      const templateId = new URLSearchParams(window.location.search).get("template") || "modern-1";
      
      const response = await sendChatMessage(
        message,
        {
          content: formContent.content, 
          templateId 
        },
        updatedMessages // Pass the updated messages including the current user message
      );
      
      // Add the assistant's response to the chat history
      setMessages(prev => [...prev, { role: "assistant", content: response.response }]);
      
      // Apply any content updates from the AI
      if (response.updates?.content) {
        const updates = response.updates.content;
        
        // Apply each update to the form
        Object.entries(updates).forEach(([key, value]) => {
          if (typeof value === 'string') {
            form.setValue(`content.${key}` as any, value);
          } else if (key === 'personalInfo' && typeof value === 'object' && value !== null) {
            // Handle nested personalInfo updates
            Object.entries(value as Record<string, unknown>).forEach(([infoKey, infoValue]) => {
              if (typeof infoValue === 'string') {
                form.setValue(`content.personalInfo.${infoKey}` as any, infoValue);
              }
            });
          }
        });
        
        toast({
          title: "Resume updated",
          description: "AI has applied updates to your resume content.",
        });
      }
    } catch (error) {
      toast({
        title: "Chat error",
        description: error instanceof Error ? error.message : "Failed to process message",
        variant: "destructive",
      });
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsProcessingChat(false);
    }
  };

  const onSubmit = (data: FormData) => {
    // If preventFormSubmit is true, don't submit
    if (preventFormSubmit) {
      setPreventFormSubmit(false);
      return;
    }
    
    if (!data.content) return;
    
    console.log("Form submitted with data:", data);
    
    // Ensure templateId is included
    const templateId = data.templateId || new URLSearchParams(window.location.search).get("template") || "modern-1";
    
    // Create a complete data object with all required fields
    const completeData = {
      ...data,
      templateId
    };
    
    // Submit the complete data
    createResumeMutation.mutate(completeData);
  };

  const handleAIOptionsUpdate = (field: keyof GenerateContentOptions, value: string) => {
    setAIOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to handle submitting the form from the floating button
  const handleSubmitForm = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  // Add a toggle preview function
  const togglePreview = (section: string) => {
    setPreviewMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Add effect to show the feature tour for first-time users
  useEffect(() => {
    const hasSeenFeatureTour = localStorage.getItem('hasSeenFeatureTour');
    if (!hasSeenTour && !hasSeenFeatureTour) {
      // Wait for the page to fully load before showing tour
      const timer = setTimeout(() => {
        setShowFeatureTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  // Enhanced tour functions
  const startAdvancedTour = () => {
    setCurrentTourStep(0);
    setShowAdvancedTour(true);
    setShowFeatureTour(false);
  };

  const nextTourStep = () => {
    if (currentTourStep < FEATURES.length - 1) {
      setCurrentTourStep(currentTourStep + 1);
    } else {
      completeAdvancedTour();
    }
  };

  const prevTourStep = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(currentTourStep - 1);
    }
  };

  const completeAdvancedTour = () => {
    setShowAdvancedTour(false);
    setHasSeenTour(true);
    localStorage.setItem('hasSeenFeatureTour', 'true');
  };

  // Enhance the existing completeFeatureTour function
  const completeFeatureTour = () => {
    setShowFeatureTour(false);
    setHasSeenTour(true);
    localStorage.setItem('hasSeenFeatureTour', 'true');
  };

  // Add this function near the other functions
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    img.src = "/images/placeholder.svg";
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-30">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            {isLoadingResume ? (
              <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            ) : (
              <h1 className="font-semibold text-lg">
                {isEditing ? "Edit Resume Content" : "Create New Resume"}
              </h1>
            )}
            
            <div className="flex items-center gap-2">

              
              <Link to={isEditing && resumeId ? `/resume/${resumeId}` : "/"}>
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  {isEditing ? "Back to Resume" : "Cancel"}
                </Button>
              </Link>
              
              <Button 
                variant="default" 
                size="sm" 
                disabled={isSubmitting}
                onClick={handleSubmitForm}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Update Resume" : "Create Resume"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Loading state when fetching existing resume */}
      {isEditing && isLoadingResume && (
        <div className="container p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading resume content...</p>
        </div>
      )}
      
      <Form {...form}>
        <form 
          ref={formRef}
          onSubmit={(e) => {
            // Check if the click came from a child form
            if (preventFormSubmit) {
              e.preventDefault();
              setPreventFormSubmit(false);
              return;
            }
            // Otherwise, let the normal form validation occur
            form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
          onClick={(e) => {
            // Reset the preventFormSubmit flag on general clicks
            if (preventFormSubmit) setPreventFormSubmit(false);
          }}
        >
          {isMobile ? (
            <main className="p-4 md:p-6">
              <div className="max-w-full mx-auto">
                <Card className="mb-6 shadow-sm">
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Resume Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Hidden field for templateId */}
                    <FormField
                      control={form.control}
                      name="templateId"
                      render={({ field }) => (
                        <input type="hidden" {...field} />
                      )}
                    />

                    <Tabs 
                      defaultValue="personal-info" 
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <div className="overflow-x-auto py-1 mb-2">
                        <TabsList 
                          className="inline-flex w-auto min-w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <TabsTrigger value="personal-info" className="text-sm">Personal</TabsTrigger>
                          <TabsTrigger value="summary" className="text-sm">Summary</TabsTrigger>
                          <TabsTrigger value="experience" className="text-sm">Experience</TabsTrigger>
                          <TabsTrigger value="education" className="text-sm">Education</TabsTrigger>
                          <TabsTrigger value="skills" className="text-sm">Skills</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="personal-info">
                        <div className="space-y-4">
                          {personalInfoFields.map((field) => (
                            <FormField
                              key={field.name}
                              control={form.control}
                              name={`content.personalInfo.${field.name}` as any}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel className="capitalize">{field.label}</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...formField}
                                      type={field.type}
                                      placeholder={field.placeholder}
                                      className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </TabsContent>

                      {sections.map((section) => (
                        <TabsContent key={section} value={section}>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <FormLabel className="text-base capitalize">{section}</FormLabel>
                                <div className="flex items-center gap-2 ml-4">
                                  <Switch
                                    id={`preview-${section}`}
                                    checked={previewMode[section] || false}
                                    onCheckedChange={() => togglePreview(section)}
                                  />
                                  <Label htmlFor={`preview-${section}`}>
                                    {previewMode[section] ? "Preview" : "Edit"}
                                  </Label>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <AIOptionsDialog 
                                  options={aiOptions}
                                  onOptionsChange={setAIOptions}
                                />
                              
                                <Button
                                  type="button" 
                                  onClick={() => generateWithAI(section as keyof Omit<ResumeContent, "personalInfo">)}
                                  variant="outline"
                                  size="sm"
                                  disabled={isGenerating}
                                >
                                  {isGenerating && activeSection === section ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      <span className="sr-only md:not-sr-only">Generating...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Wand2 className="mr-2 h-4 w-4" />
                                      <span className="sr-only md:not-sr-only">Generate with AI</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                            <FormField
                              control={form.control}
                              name={`content.${section}` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    {previewMode[section] ? (
                                      <div className="min-h-[200px] md:min-h-[300px] border rounded-md p-4 overflow-auto bg-white prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={{
                                            p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                            ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                                            ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                                            li: ({children}) => <li className="mb-1">{children}</li>,
                                            h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                            h2: ({children}) => <h2 className="text-md font-bold mb-2">{children}</h2>,
                                            h3: ({children}) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                                            code: ({className, children}) => {
                                              const match = /language-(\w+)/.exec(className || '');
                                              const isInlineCode = !match && className === undefined;
                                              
                                              return isInlineCode 
                                                ? <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>
                                                : <code className="block bg-muted p-2 rounded text-sm my-2 whitespace-pre-wrap">{children}</code>;
                                            }
                                          }}
                                        >
                                          {field.value || ''}
                                        </ReactMarkdown>
                                      </div>
                                    ) : (
                                      <Textarea 
                                        {...field} 
                                        className="min-h-[200px] md:min-h-[300px] font-mono text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700" 
                                      />
                                    )}
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </main>
          ) : (
            // Desktop layout with resizable panels
          <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-6rem)]">
            <ResizablePanel defaultSize={65} minSize={50}>
              <main className="p-6 h-full overflow-auto">
                <div className="max-w-5xl mx-auto">
                    <Card className="mb-6 shadow-sm">
                    <CardContent className="pt-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Resume Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                        {/* Hidden field for templateId */}
                        <FormField
                          control={form.control}
                          name="templateId"
                          render={({ field }) => (
                            <input type="hidden" {...field} />
                        )}
                      />

                      <Tabs defaultValue="personal-info" className="w-full">
                        <TabsList className="grid grid-cols-5 mb-4">
                          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
                          <TabsTrigger value="summary">Summary</TabsTrigger>
                          <TabsTrigger value="experience">Experience</TabsTrigger>
                          <TabsTrigger value="education">Education</TabsTrigger>
                          <TabsTrigger value="skills">Skills</TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal-info">
                          <div className="space-y-4">
                            {personalInfoFields.map((field) => (
                              <FormField
                                key={field.name}
                                control={form.control}
                                name={`content.personalInfo.${field.name}` as any}
                                render={({ field: formField }) => (
                                  <FormItem>
                                    <FormLabel className="capitalize">{field.label}</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...formField}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </TabsContent>

                        {sections.map((section) => (
                          <TabsContent key={section} value={section}>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2">
                                <FormLabel className="text-base capitalize">{section}</FormLabel>
                                    <div className="flex items-center gap-2 ml-4">
                                      <Switch
                                        id={`preview-${section}`}
                                        checked={previewMode[section] || false}
                                        onCheckedChange={() => togglePreview(section)}
                                      />
                                      <Label htmlFor={`preview-${section}`}>
                                        {previewMode[section] ? "Preview" : "Edit"}
                                      </Label>
                                    </div>
                                  </div>
                                <div className="flex items-center gap-2">
                                  <AIOptionsDialog 
                                    options={aiOptions}
                                    onOptionsChange={setAIOptions}
                                  />
                                
                                  <Button
                                    type="button" 
                                    onClick={() => generateWithAI(section as keyof Omit<ResumeContent, "personalInfo">)}
                                    variant="outline"
                                    size="sm"
                                    disabled={isGenerating}
                                  >
                                    {isGenerating && activeSection === section ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                      </>
                                    ) : (
                                      <>
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        Generate with AI
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <FormField
                                control={form.control}
                                name={`content.${section}` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                        {previewMode[section] ? (
                                          <div className="min-h-[200px] md:min-h-[300px] border rounded-md p-4 overflow-auto bg-white prose prose-sm max-w-none dark:prose-invert">
                                            <ReactMarkdown
                                              remarkPlugins={[remarkGfm]}
                                              components={{
                                                p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                                ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                                                ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                                                li: ({children}) => <li className="mb-1">{children}</li>,
                                                h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                                h2: ({children}) => <h2 className="text-md font-bold mb-2">{children}</h2>,
                                                h3: ({children}) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                                                code: ({className, children}) => {
                                                  const match = /language-(\w+)/.exec(className || '');
                                                  const isInlineCode = !match && className === undefined;
                                                  
                                                  return isInlineCode 
                                                    ? <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>
                                                    : <code className="block bg-muted p-2 rounded text-sm my-2 whitespace-pre-wrap">{children}</code>;
                                                }
                                              }}
                                            >
                                              {field.value || ''}
                                            </ReactMarkdown>
                                          </div>
                                        ) : (
                                      <Textarea 
                                        {...field} 
                                        className="min-h-[300px] font-mono text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700" 
                                      />
                                        )}
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>

                        <div className="flex justify-between mt-6">
                    <Button variant="outline" type="button" asChild>
                      <Link href="/templates">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Templates
                      </Link>
                    </Button>
                          
                          <Button 
                            type="button" 
                            onClick={handleSubmitForm}
                            disabled={isSubmitting}
                          >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Resume
                              </>
                      )}
                    </Button>
                  </div>
                      </CardContent>
                    </Card>
                </div>
              </main>
            </ResizablePanel>
            
            <ResizablePanel defaultSize={35} minSize={30}>
                <AIGeneratorAssistant
                  currentSection={activeSection || activeTab}
                  currentValue={activeValue}
                  onUpdateContent={handleSectionContentUpdate}
                  jobTitle={aiOptions.jobTitle}
                  industry={aiOptions.industry}
                  experienceLevel={aiOptions.experienceLevel}
                  onClose={() => setShowChatPanel(false)}
                  onFormSubmit={() => setPreventFormSubmit(true)}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
          )}
        </form>
      </Form>

      {/* Floating Save Button for Mobile */}
      {isMobile && (
        <div className="fixed bottom-5 right-5 z-10">
          <Button 
            type="button" 
            onClick={handleSubmitForm}
            disabled={isSubmitting}
            size="lg"
            className="rounded-full shadow-lg h-14 w-14 p-0"
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Save className="h-6 w-6" />
            )}
          </Button>
        </div>
      )}

      {/* Chat Button for Mobile */}
      {isMobile && (
        <div className="fixed bottom-5 left-5 z-10">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full shadow-lg h-14 w-14 p-0 bg-white"
            onClick={() => setShowChatPanel(true)}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Mobile Chat Panel */}
      {isMobile && showChatPanel && (
        <AIGeneratorAssistant
          currentSection={activeSection || activeTab}
          currentValue={activeValue}
          onUpdateContent={handleSectionContentUpdate}
          jobTitle={aiOptions.jobTitle}
          industry={aiOptions.industry}
          experienceLevel={aiOptions.experienceLevel}
          onClose={() => setShowChatPanel(false)}
          onFormSubmit={() => setPreventFormSubmit(true)}
        />
      )}

      {/* Enhanced Feature Discovery Dialog */}
      <AlertDialog open={showFeatureTour} onOpenChange={setShowFeatureTour}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <AlertDialogTitle>Welcome to ResumeForge!</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Create professional resumes with AI assistance in minutes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4 space-y-4">
            {FEATURES.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={startAdvancedTour} 
              className="w-full sm:w-auto"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Show me how
            </Button>
            <AlertDialogAction 
              onClick={completeFeatureTour}
              className="w-full sm:w-auto"
            >
              <Check className="mr-2 h-4 w-4" />
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Advanced Interactive Tour */}
      <AlertDialog open={showAdvancedTour} onOpenChange={setShowAdvancedTour}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              {FEATURES[currentTourStep].icon}
              <AlertDialogTitle>{FEATURES[currentTourStep].title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {FEATURES[currentTourStep].description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 flex items-center justify-center">
              <img 
                src={`/images/tour/feature-${currentTourStep + 1}.svg`} 
                alt={FEATURES[currentTourStep].title}
                className="max-h-32 opacity-90"
                onError={handleImageError}
              />
            </div>
            
            <div className="flex justify-center mt-4">
              {FEATURES.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    index === currentTourStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <AlertDialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={prevTourStep}
                disabled={currentTourStep === 0}
                size="sm"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={nextTourStep}
                size="sm"
              >
                {currentTourStep === FEATURES.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
            <Button 
              variant="ghost" 
              onClick={completeAdvancedTour}
              size="sm"
            >
              Skip
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enhanced Help Button with Tooltip - Mobile */}
      {isMobile && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed bottom-24 left-5 z-10 rounded-full shadow-lg h-10 w-10 p-0 bg-white dark:bg-gray-800"
                onClick={() => setShowFeatureTour(true)}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Need help? Click for features guide</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Enhanced Help Button with Tooltip - Desktop */}
      {!isMobile && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed bottom-5 left-5 z-10 rounded-full shadow-lg h-10 w-10 p-0 bg-white dark:bg-gray-800"
                onClick={() => setShowFeatureTour(true)}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Need help? Click for features guide</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}