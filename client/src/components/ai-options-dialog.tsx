import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GenerateContentOptions } from "@/lib/ai-service";
import { Badge } from "@/components/ui/badge";

// Industry options for tailoring resume content
export const industryOptions = [
  // { value: "", label: "Not specified" },
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
  // { value: "", label: "Not specified" },
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

interface AIOptionsDialogProps {
  options: GenerateContentOptions;
  onOptionsChange: (options: GenerateContentOptions) => void;
}

/**
 * Dialog component for customizing AI content generation options
 * 
 * @component
 * @param {AIOptionsDialogProps} props - The component props
 * @returns {JSX.Element} The AI options dialog component
 */
export function AIOptionsDialog({ options, onOptionsChange }: AIOptionsDialogProps) {
  const [localOptions, setLocalOptions] = useState<GenerateContentOptions>(options);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("basics");
  
  // Update a single option field
  const handleOptionChange = (field: keyof GenerateContentOptions, value: string | boolean) => {
    setLocalOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Apply the changes to the parent component
  const handleApply = () => {
    onOptionsChange(localOptions);
    setOpen(false);
  };
  
  // Reset options when dialog opens to match current options
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalOptions(options);
      // Set default tab
      setActiveTab("basics");
    }
    setOpen(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
        >
          <Settings className="h-4 w-4" />
          <span>AI Options</span>
          {(localOptions.jobDescription || localOptions.optimizeForATS) && (
            <Badge variant="outline" className="ml-1 px-1 py-0 text-xs bg-primary/10">
              Advanced
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customize AI Content Generation</DialogTitle>
          <DialogDescription>
            Tailor the AI-generated content to your specific needs and preferences
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="basics">Basic Options</TabsTrigger>
            <TabsTrigger value="advanced">
              Advanced Options
              {(localOptions.jobDescription || localOptions.optimizeForATS) && (
                <Badge variant="outline" className="ml-1 px-1.5 py-0 text-xs">
                  Active
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="jobTitle" className="text-right text-sm">Job Title</label>
                <Input
                  id="jobTitle"
                  className="col-span-3"
                  value={localOptions.jobTitle || ""}
                  onChange={(e) => handleOptionChange('jobTitle', e.target.value)}
                  placeholder="e.g. Senior Developer"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="industry" className="text-right text-sm">Industry</label>
                <div className="col-span-3">
                  <Select 
                    value={localOptions.industry || ""} 
                    onValueChange={(value) => handleOptionChange('industry', value)}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="experienceLevel" className="text-right text-sm">Experience</label>
                <div className="col-span-3">
                  <Select 
                    value={localOptions.experienceLevel || ""} 
                    onValueChange={(value) => handleOptionChange('experienceLevel', value)}
                  >
                    <SelectTrigger id="experienceLevel">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="tone" className="text-right text-sm">Content Tone</label>
                <div className="col-span-3">
                  <Select 
                    value={localOptions.tone || "professional"} 
                    onValueChange={(value) => handleOptionChange('tone', value)}
                  >
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="jobDescription" className="text-right text-sm mt-2">
                  Job Description
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="ml-1">
                        <span className="inline-block w-4 h-4 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">?</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Paste a job description to tailor your resume content. 
                          The AI will extract key skills and requirements to customize your content.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <div className="col-span-3">
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste job description here to tailor your resume content"
                    className="min-h-[120px]"
                    value={localOptions.jobDescription || ""}
                    onChange={(e) => handleOptionChange('jobDescription', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This helps the AI tailor your content to match job requirements
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="text-right text-sm">
                  ATS Optimization
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="ml-1">
                        <span className="inline-block w-4 h-4 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">?</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Optimize content for Applicant Tracking Systems (ATS). 
                          Enabling this will format content to be more easily parsed by automated systems 
                          and include key terms from the job description.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="optimizeForATS"
                    checked={!!localOptions.optimizeForATS}
                    onCheckedChange={(checked) => handleOptionChange('optimizeForATS', checked)}
                  />
                  <Label htmlFor="optimizeForATS">
                    Enable ATS optimization
                  </Label>
                </div>
                <div className="col-span-3 col-start-2">
                  <p className="text-sm text-muted-foreground">
                    Makes your resume more likely to pass automated screening processes used by employers
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 