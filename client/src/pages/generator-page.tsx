import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronLeft, Download, Wand2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertResumeSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";

type FormData = {
  name: string;
  content: {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
    };
    experience: string;
    education: string;
    skills: string;
    summary: string;
  };
};

export default function GeneratorPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormData>({
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
    },
  });

  const createResumeMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const templateId = new URLSearchParams(window.location.search).get("template") || "modern-1";
      return apiRequest("POST", "/api/resumes", {
        name: data.name,
        content: data.content,
        templateId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Resume created",
        description: "Your resume has been saved successfully",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create resume",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateWithAI = async (section: string) => {
    if (!user?.isPremium && user?.generationCount >= 2) {
      toast({
        title: "Free tier limit reached",
        description: "Upgrade to premium for unlimited generations",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    // Simulated AI generation - in real implementation, this would call the AI API
    setTimeout(() => {
      const sampleText = `Generated ${section} content would appear here. This is a placeholder for the AI-generated content that would be produced using the Gemini API.`;
      form.setValue(`content.${section}` as any, sampleText);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/templates">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Resume Generator</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={form.handleSubmit((data) => createResumeMutation.mutate(data))}
                disabled={createResumeMutation.isPending}
              >
                {createResumeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Resume
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="content.personalInfo.fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="content.personalInfo.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="content.personalInfo.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="content.personalInfo.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {["summary", "experience", "education", "skills"].map((section) => (
                    <TabsContent key={section} value={section}>
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            onClick={() => generateWithAI(section)}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            Generate with AI
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name={`content.${section}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="min-h-[300px]"
                                  placeholder={`Enter your ${section}...`}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
