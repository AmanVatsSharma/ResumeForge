import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ATSScanner } from "@/components/ats-scanner";
import { KeywordAnalyzer } from "@/components/keyword-analyzer";
import { JobTailor } from "@/components/job-tailor";
import { ResumeContent } from "@shared/schema";
import { FileSearch, Sparkles, ArrowRightLeft } from "lucide-react";

interface AIToolsPanelProps {
  resumeContent: ResumeContent;
  onContentUpdate: (updatedContent: ResumeContent) => void;
  onClose?: () => void;
}

export function AIToolsPanel({ resumeContent, onContentUpdate, onClose }: AIToolsPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("ats");

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">AI Resume Tools</CardTitle>
            <CardDescription>
              Advanced tools to optimize your resume for job applications
            </CardDescription>
          </div>
          <Badge variant="default" className="py-1">Premium</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ats" className="flex items-center gap-1">
              <FileSearch className="h-4 w-4" />
              <span className="hidden sm:inline">ATS Scanner</span>
              <span className="sm:hidden">ATS</span>
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Keyword Analyzer</span>
              <span className="sm:hidden">Keywords</span>
            </TabsTrigger>
            <TabsTrigger value="tailor" className="flex items-center gap-1">
              <ArrowRightLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Job Tailor</span>
              <span className="sm:hidden">Tailor</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="ats" className="m-0">
              <ATSScanner resumeContent={resumeContent} />
            </TabsContent>
            
            <TabsContent value="keywords" className="m-0">
              <KeywordAnalyzer resumeContent={resumeContent} />
            </TabsContent>
            
            <TabsContent value="tailor" className="m-0">
              <JobTailor resumeContent={resumeContent} onUpdate={onContentUpdate} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
} 