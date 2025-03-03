import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileSearch, AlertCircle, Check, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { scanResumeForATS, type ATSScanResult } from "@/lib/ai-service";
import { ResumeContent } from "@shared/schema";

interface ATSScannerProps {
  resumeContent: ResumeContent;
}

export function ATSScanner({ resumeContent }: ATSScannerProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ATSScanResult | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);

  const runATSScan = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      const results = await scanResumeForATS(resumeContent, jobDescription || undefined);
      setScanResults(results);
    } catch (err) {
      console.error("ATS scan error:", err);
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-amber-600";
    return "bg-red-600";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">ATS Compatibility Scanner</CardTitle>
            <CardDescription>
              Check how well your resume will perform with Applicant Tracking Systems
            </CardDescription>
          </div>
          {scanResults && (
            <div className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground">Score:</span>
              <span className={`text-2xl font-bold ${getScoreColor(scanResults.score)}`}>
                {scanResults.score}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scanResults ? (
          <div className="space-y-4">
            <Textarea
              placeholder="Paste the job description here for a targeted ATS scan. This helps analyze your resume against specific job requirements."
              className="min-h-[150px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              For best results, include a job description to analyze your resume against specific requirements.
              If you don't provide a job description, we'll perform a general ATS compatibility check.
            </p>
          </div>
        ) : (
          <div>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="keywords">
                  Keywords
                  {scanResults.missingKeywords.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {scanResults.missingKeywords.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sections">Section Scores</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Progress 
                  value={scanResults.score} 
                  className="h-2" 
                  indicatorClassName={getProgressColor(scanResults.score)}
                />
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Suggestions for Improvement</h3>
                  <ul className="space-y-2">
                    {scanResults.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="keywords" className="space-y-4">
                {scanResults.missingKeywords.length > 0 ? (
                  <div>
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Missing Keywords</AlertTitle>
                      <AlertDescription>
                        Your resume is missing {scanResults.missingKeywords.length} important keywords from the job description.
                      </AlertDescription>
                    </Alert>
                    
                    <h3 className="font-medium mb-2">Recommended Keywords to Add</h3>
                    <div className="flex flex-wrap gap-2">
                      {scanResults.missingKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="bg-red-50">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertTitle>Great keyword coverage!</AlertTitle>
                    <AlertDescription>
                      Your resume includes all important keywords from the job description.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="sections" className="space-y-4">
                <h3 className="font-medium mb-2">Section-by-Section Analysis</h3>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(scanResults.sectionScores).map(([section, score]) => (
                    <AccordionItem key={section} value={section}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="capitalize">{section}</span>
                          <span className={`font-medium ${getScoreColor(score)}`}>
                            {score}%
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2">
                          <Progress 
                            value={score} 
                            className="h-2" 
                            indicatorClassName={getProgressColor(score)}
                          />
                          <p className="mt-2 text-sm text-muted-foreground">
                            {score >= 80 
                              ? "This section performs well for ATS systems."
                              : score >= 60 
                                ? "This section could use some improvement for better ATS compatibility."
                                : "This section needs significant improvement for ATS compatibility."}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
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
      <CardFooter className="flex justify-between">
        {!scanResults ? (
          <Button onClick={runATSScan} disabled={isScanning} className="w-full">
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <FileSearch className="mr-2 h-4 w-4" />
                Scan Resume for ATS Compatibility
              </>
            )}
          </Button>
        ) : (
          <div className="flex w-full gap-4">
            <Button variant="outline" onClick={() => setScanResults(null)} className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              New Scan
            </Button>
            <Button 
              variant="default" 
              onClick={() => window.print()} 
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 