import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileSearch, ArrowRight, Check, AlertCircle, FileText, Sparkles } from "lucide-react";
import { analyzeResumeKeywords, type KeywordAnalysisResult } from "@/lib/ai-service";
import { ResumeContent } from "@shared/schema";
import { industryOptions } from "@/components/ai-options-dialog";

interface KeywordAnalyzerProps {
  resumeContent: ResumeContent;
}

export function KeywordAnalyzer({ resumeContent }: KeywordAnalyzerProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<KeywordAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("current");
  const [error, setError] = useState<string | null>(null);

  const runKeywordAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const results = await analyzeResumeKeywords(
        resumeContent, 
        jobDescription || undefined,
        industry || undefined
      );
      setAnalysisResults(results);
    } catch (err) {
      console.error("Keyword analysis error:", err);
      setError("Failed to analyze keywords. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Keyword Analyzer</CardTitle>
        <CardDescription>
          Optimize your resume keywords for better visibility with hiring managers and ATS systems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysisResults ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description (Recommended)</label>
              <Textarea
                placeholder="Paste the job description here for targeted keyword analysis"
                className="min-h-[120px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For best results, include a job description to optimize for specific requirements
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an industry (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Helps identify industry-specific keywords if no job description is provided
              </p>
            </div>
          </div>
        ) : (
          <div>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="current">Current Keywords</TabsTrigger>
                <TabsTrigger value="suggested">
                  Suggested
                  <Badge variant="secondary" className="ml-2 bg-primary/10">
                    {analysisResults.suggestedKeywords.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="missing">
                  Missing
                  {analysisResults.missingKeywords.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {analysisResults.missingKeywords.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="overused">
                  Overused
                  {analysisResults.overusedKeywords.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {analysisResults.overusedKeywords.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="space-y-4">
                <Alert variant="default" className="bg-muted/50">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Top Keywords in Your Resume</AlertTitle>
                  <AlertDescription>
                    These are the most prominent keywords found in your resume
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {analysisResults.topKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-muted">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="suggested" className="space-y-4">
                <Alert variant="default" className="bg-primary/10 border-primary/20">
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Recommended Keywords</AlertTitle>
                  <AlertDescription>
                    Keywords that would enhance your resume based on the job description or industry
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {analysisResults.suggestedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="border-primary/30 bg-primary/5">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="missing" className="space-y-4">
                {analysisResults.missingKeywords.length > 0 ? (
                  <>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Missing Keywords</AlertTitle>
                      <AlertDescription>
                        Important keywords that are missing from your resume
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {analysisResults.missingKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="bg-red-50 border-red-200">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </>
                ) : (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertTitle>No Missing Keywords</AlertTitle>
                    <AlertDescription>
                      Your resume includes all important keywords from the job description
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="overused" className="space-y-4">
                {analysisResults.overusedKeywords.length > 0 ? (
                  <>
                    <Alert variant="default" className="border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <AlertTitle>Overused Keywords</AlertTitle>
                      <AlertDescription>
                        Keywords that appear too frequently in your resume
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {analysisResults.overusedKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="bg-amber-50 border-amber-200">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">
                      Consider replacing some instances with synonyms or more specific terms
                    </p>
                  </>
                ) : (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertTitle>Good Keyword Balance</AlertTitle>
                    <AlertDescription>
                      Your resume has a good balance of keywords without overuse
                    </AlertDescription>
                  </Alert>
                )}
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
      <CardFooter>
        {!analysisResults ? (
          <Button 
            onClick={runKeywordAnalysis} 
            disabled={isAnalyzing || (!jobDescription && !industry)} 
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Keywords...
              </>
            ) : (
              <>
                <FileSearch className="mr-2 h-4 w-4" />
                Analyze Resume Keywords
              </>
            )}
          </Button>
        ) : (
          <div className="flex w-full gap-4">
            <Button variant="outline" onClick={() => setAnalysisResults(null)} className="flex-1">
              <ArrowRight className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => window.print()}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 