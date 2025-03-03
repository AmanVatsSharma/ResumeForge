import { useState } from "react";
import { Share2, Copy, Check, Crown, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { isTemplatePremium, getTemplateName } from "@/components/templates";

interface ShareDialogProps {
  resumeId: string;
  resumeName: string;
  templateId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPremiumUser?: boolean;
  onUpgrade?: () => void;
}

export function ShareDialog({
  resumeId,
  resumeName,
  templateId = '',
  open,
  onOpenChange,
  isPremiumUser = false,
  onUpgrade
}: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const isTemplateRestricted = templateId ? isTemplatePremium(templateId) && !isPremiumUser : false;

  const generateShareLink = async () => {
    if (isTemplateRestricted) {
      toast({
        title: "Premium Template",
        description: "Please upgrade to share resumes with premium templates",
        variant: "destructive",
      });
      onUpgrade?.();
      return;
    }
    
    setIsGeneratingLink(true);
    try {
      const response = await apiRequest("POST", `/api/share/${resumeId}`, {
        isPublic
      });
      const data = await response.json();
      
      // Create the full share URL
      const shareBaseUrl = window.location.origin;
      const shareLink = `${shareBaseUrl}/share/${data.shareCode}`;
      setShareUrl(shareLink);
      
      toast({
        title: "Share link created",
        description: isPublic 
          ? "Your resume is now public and can be viewed by anyone with the link"
          : "Your resume can be viewed by anyone with the link",
      });
    } catch (error) {
      console.error("Error generating share link:", error);
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Resume</DialogTitle>
          <DialogDescription>
            Create a link to share your resume with others.
          </DialogDescription>
        </DialogHeader>
        
        {isTemplateRestricted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex items-start gap-2">
              <Crown className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-medium text-yellow-800">Premium Template</h4>
                <p className="text-sm text-yellow-700">
                  You're using the premium "{getTemplateName(templateId)}" template. Upgrade to share resumes with premium templates.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0"
                  onClick={onUpgrade}
                >
                  <Lock className="mr-2 h-3.5 w-3.5" />
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2 py-4">
          <Switch 
            id="public-link" 
            checked={isPublic} 
            onCheckedChange={setIsPublic} 
            disabled={isTemplateRestricted}
          />
          <Label htmlFor="public-link">Make resume publicly accessible</Label>
        </div>
        
        <div className="grid gap-4 py-4">
          {shareUrl ? (
            <div className="space-y-2">
              <Label htmlFor="share-link" className="text-sm text-muted-foreground">
                Share Link
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="share-link"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyToClipboard} size="icon" variant="outline">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isPublic 
                  ? "Anyone with this link can view your resume without signing in."
                  : "Only people with this link can view your resume."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">
                Generate a link to share your resume <strong>"{resumeName}"</strong> with others.
              </p>
              <p className="text-xs text-muted-foreground">
                {isPublic 
                  ? "Your resume will be accessible to anyone with the link, even without signing in."
                  : "Your resume will only be accessible to people with the link."
                }
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          
          {!shareUrl && (
            <Button 
              onClick={generateShareLink} 
              disabled={isGeneratingLink || isTemplateRestricted}
              variant={isTemplateRestricted ? "outline" : "default"}
            >
              {isGeneratingLink ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : isTemplateRestricted ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Upgrade to Share
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Generate Link
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 