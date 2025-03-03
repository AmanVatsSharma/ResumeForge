import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileSearch, AlertCircle, ArrowRight, ArrowRightLeft, Check } from "lucide-react";
import { tailorResumeToJobDescription } from "@/lib/ai-service";
import { ResumeContent } from "@shared/schema";
import { DiffEditor } from "@/components/diff-editor";

interface JobTailorProps {
  resumeContent: ResumeContent;
  onUpdate: (updatedContent: ResumeContent) => void;
}

export function JobTailor({ resumeContent, onUpdate }: JobTailorProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [optimizeForATS, setOptimizeForATS] = useState(true);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredContent, setTailoredContent] = useState<ResumeContent | null>(null);
  const [activeSection, setActiveSection] = useState<keyof ResumeContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // List of sections to show in the tabs
  const sections: Array<keyof ResumeContent> = ["summary", "experience", "education", "skills"];

  const runTailoring = async () => {
    if (!jobDescription.trim()) {
      setError("Please provide a job description to tailor your resume");
      return;
    }

    setIsTailoring(true);
    setError(null);
    
    try {
      const tailored = await tailorResumeToJobDescription(
        resumeContent,
        jobDescription,
        optimizeForATS
      );
      setTailoredContent(tailored);
      setActiveSection("summary"); // Set first section as active
    } catch (err) {
      console.error("Tailoring error:", err);
      setError("Failed to tailor resume. Please try again.");
    } finally {
      setIsTailoring(false);
    }
  };

  const applyChanges = () => {
    if (tailoredContent) {
      onUpdate(tailoredContent);
      // Reset state after applying changes
      setTailoredContent(null);
      setJobDescription("");
    }
  };

  const getSectionContent = (content: ResumeContent | null, section: keyof ResumeContent) => {
    if (!content) return "";
    
    if (section === "personalInfo") {
      return JSON.stringify(content[section], null, 2);
    }
    
    return content[section] as string;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Job Description Tailoring</CardTitle>
        <CardDescription>
          Customize your resume content to match specific job requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!tailoredContent ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description</label>
              <Textarea
                placeholder="Paste the job description here to tailor your resume"
                className="min-h-[200px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The AI will analyze the job description and adapt your resume to highlight relevant skills and experience
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="ats-optimize"
                checked={optimizeForATS}
                onCheckedChange={setOptimizeForATS}
              />
              <Label htmlFor="ats-optimize" className="cursor-pointer">
                Optimize for Applicant Tracking Systems (ATS)
              </Label>
            </div>
            
            <p className="text-xs text-muted-foreground">
              When enabled, your resume will be formatted to be more easily parsed by automated systems
              and include key terms from the job description
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle>Resume Tailored Successfully</AlertTitle>
              <AlertDescription>
                Your resume has been tailored to match the job description. 
                Review the changes and apply them to your resume.
              </AlertDescription>
            </Alert>
            
            <Tabs 
              value={activeSection || "summary"} 
              onValueChange={(value) => setActiveSection(value as keyof ResumeContent)}
            >
              <TabsList className="mb-4">
                {sections.map((section) => (
                  <TabsTrigger key={section} value={section} className="capitalize">
                    {section}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {sections.map((section) => (
                <TabsContent key={section} value={section} className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                      <h3 className="font-medium capitalize">{section}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <div className="flex items-center mr-4">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                          <span>Original</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                          <span>Tailored</span>
                        </div>
                      </div>
                    </div>
                    <DiffEditor
                      original={getSectionContent(resumeContent, section)}
                      modified={getSectionContent(tailoredContent, section)}
                      height="300px"
                      readOnly
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {!tailoredContent ? (
          <Button 
            onClick={runTailoring} 
            disabled={isTailoring || !jobDescription.trim()} 
            className="w-full"
          >
            {isTailoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tailoring Resume...
              </>
            ) : (
              <>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Tailor to Job Description
              </>
            )}
          </Button>
        ) : (
          <div className="flex w-full gap-4">
            <Button variant="outline" onClick={() => setTailoredContent(null)} className="flex-1">
              <ArrowRight className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              variant="default"
              onClick={applyChanges}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Apply Changes
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 