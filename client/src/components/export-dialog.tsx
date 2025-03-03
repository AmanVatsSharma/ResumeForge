import { useState } from "react";
import { Copy, Download, FileText, FileIcon, Mail, Lock, Crown } from "lucide-react";
import { ResumeContent } from "@shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { 
  exportToPdf, 
  exportToDocx, 
  copyToClipboard,
  emailResume
} from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { isTemplatePremium, getTemplateName } from "@/components/templates";

interface ExportDialogProps {
  resumeContent: ResumeContent;
  templateId: string;
  templateConfig: any;
  onClose: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isPremiumUser?: boolean;
  onUpgrade?: () => void;
}

export function ExportDialog({
  resumeContent,
  templateId,
  templateConfig,
  onClose,
  open = false,
  onOpenChange,
  isPremiumUser = false,
  onUpgrade
}: ExportDialogProps) {
  const { toast } = useToast();
  const [exportOption, setExportOption] = useState<"pdf" | "docx" | "copy" | "email">("pdf");
  const [filename, setFilename] = useState("my-resume");
  const [email, setEmail] = useState("");
  const [exporting, setExporting] = useState(false);
  
  const isTemplateRestricted = isTemplatePremium(templateId) && !isPremiumUser;
  
  const handleExport = async () => {
    if (isTemplateRestricted) {
      toast({
        title: "Premium Template",
        description: "Please upgrade to export resumes with premium templates",
        variant: "destructive",
      });
      onUpgrade?.();
      return;
    }
    
    setExporting(true);
    try {
      switch (exportOption) {
        case "pdf":
          await exportToPdf(resumeContent, `${filename}.pdf`, templateId, templateConfig);
          toast({
            title: "Export successful",
            description: "Your resume has been exported as a PDF file.",
          });
          break;
        case "docx":
          await exportToDocx(resumeContent, templateId, `${filename}.docx`);
          toast({
            title: "Export successful",
            description: "Your resume has been exported as a DOCX file.",
          });
          break;
        case "copy":
          await copyToClipboard(resumeContent);
          toast({
            title: "Copy successful",
            description: "Your resume has been copied to the clipboard.",
          });
          break;
        case "email":
          if (!email) {
            toast({
              title: "Missing email",
              description: "Please enter an email address.",
              variant: "destructive",
            });
            setExporting(false);
            return;
          }
          await emailResume(resumeContent, email, templateId, templateConfig);
          toast({
            title: "Email sent",
            description: `Your resume has been sent to ${email}.`,
          });
          break;
      }
      
      // Close dialog on successful export
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export resume",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Resume</DialogTitle>
          <DialogDescription>
            Choose how you want to export your resume.
          </DialogDescription>
        </DialogHeader>
        
        {isTemplateRestricted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex items-start gap-2">
              <Crown className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-medium text-yellow-800">Premium Template</h4>
                <p className="text-sm text-yellow-700">
                  You're using the premium "{getTemplateName(templateId)}" template. Upgrade to export resumes with premium templates.
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
        
        <div className="flex flex-col gap-4 py-4">
          <RadioGroup 
            value={exportOption} 
            onValueChange={(value) => setExportOption(value as any)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" disabled={isTemplateRestricted} />
              <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                PDF Document
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="docx" id="docx" disabled={isTemplateRestricted || true} />
              <Label htmlFor="docx" className="flex items-center cursor-pointer">
                <FileIcon className="mr-2 h-4 w-4" />
                Word Document
                <span className="ml-1 text-xs text-muted-foreground">(Coming soon)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="copy" id="copy" disabled={isTemplateRestricted} />
              <Label htmlFor="copy" className="flex items-center cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" disabled={isTemplateRestricted} />
              <Label htmlFor="email" className="flex items-center cursor-pointer">
                <Mail className="mr-2 h-4 w-4" />
                Email Resume
              </Label>
            </div>
          </RadioGroup>
          
          {exportOption === "pdf" || exportOption === "docx" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="filename">Filename</Label>
              <Input 
                id="filename" 
                value={filename} 
                onChange={(e) => setFilename(e.target.value)}
                disabled={isTemplateRestricted}
              />
            </div>
          ) : exportOption === "email" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recipient@example.com"
                disabled={isTemplateRestricted}
              />
            </div>
          ) : null}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant={isTemplateRestricted ? "outline" : "default"}
            onClick={handleExport}
            disabled={exporting || (exportOption === "email" && !email)}
          >
            {exporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : isTemplateRestricted ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Upgrade to Export
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {exportOption === "pdf" ? "Download PDF" : 
                 exportOption === "docx" ? "Download DOCX" : 
                 exportOption === "copy" ? "Copy to Clipboard" : "Send Email"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 