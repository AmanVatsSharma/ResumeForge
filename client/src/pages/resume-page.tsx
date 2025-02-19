import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Resume } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Download, Share2, Crown } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PaymentDialog } from "@/components/payment-dialog";

// Base template component that all other templates will extend
function BaseTemplate({ content }: { content: Resume["content"] }) {
  return (
    <div className="max-w-[21cm] mx-auto bg-white p-8 shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {content.personalInfo.fullName}
        </h1>
        <div className="mt-2 text-gray-600 space-y-1">
          <p>{content.personalInfo.email}</p>
          <p>{content.personalInfo.phone}</p>
          <p>{content.personalInfo.location}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
          Professional Summary
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">{content.summary}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
          Experience
        </h2>
        <div className="text-gray-700 whitespace-pre-wrap">
          {content.experience}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
          Education
        </h2>
        <div className="text-gray-700 whitespace-pre-wrap">
          {content.education}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
          Skills
        </h2>
        <div className="text-gray-700 whitespace-pre-wrap">{content.skills}</div>
      </div>
    </div>
  );
}

// Define all template components before the templates object
const ModernTemplate = BaseTemplate;
const ExecutiveTemplate = BaseTemplate;
const CreativeTemplate = BaseTemplate;
const TechnicalTemplate = BaseTemplate;
const AcademicTemplate = BaseTemplate;
const MinimalTemplate = BaseTemplate;

// Template definitions with their configurations
const templates = {
  "modern-1": {
    name: "Modern Professional",
    component: ModernTemplate,
    premium: false,
    price: 0,
  },
  "executive-1": {
    name: "Executive",
    component: ExecutiveTemplate,
    premium: false,
    price: 0,
  },
  "creative-1": {
    name: "Creative Portfolio",
    component: CreativeTemplate,
    premium: true,
    price: 99,
  },
  "technical-1": {
    name: "Technical Specialist",
    component: TechnicalTemplate,
    premium: true,
    price: 199,
  },
  "academic-1": {
    name: "Academic CV",
    component: AcademicTemplate,
    premium: true,
    price: 299,
  },
  "minimal-1": {
    name: "Minimal",
    component: MinimalTemplate,
    premium: false,
    price: 0,
  }
};

export default function ResumePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const { data: resume, isLoading } = useQuery<Resume>({
    queryKey: [`/api/resumes/${id}`],
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const res = await apiRequest("PATCH", `/api/resumes/${id}/template`, {
        templateId,
      });
      return await res.json();
    },
    onSuccess: (updatedResume) => {
      queryClient.setQueryData([`/api/resumes/${id}`], updatedResume);
      toast({
        title: "Template updated",
        description: "Your resume template has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTemplateChange = (templateId: string) => {
    const template = templates[templateId as keyof typeof templates];

    if (template.premium && !user?.isPremium) {
      setSelectedTemplateId(templateId);
      setShowPremiumDialog(true);
    } else {
      updateTemplateMutation.mutate(templateId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Resume not found</h1>
        <Button asChild>
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    );
  }

  const Template = templates[resume.templateId as keyof typeof templates]?.component || ModernTemplate;
  const currentTemplate = templates[resume.templateId as keyof typeof templates];
  const selectedTemplate = selectedTemplateId ? templates[selectedTemplateId as keyof typeof templates] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{resume.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={resume.templateId}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templates).map(([id, template]) => (
                    <SelectItem key={id} value={id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{template.name}</span>
                        {template.premium && !user?.isPremium && (
                          <Crown className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" disabled>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6">
            <Template content={resume.content} />
          </CardContent>
        </Card>
      </main>

      <PaymentDialog
        open={showPremiumDialog}
        onOpenChange={setShowPremiumDialog}
        type="template"
        templateId={selectedTemplateId || undefined}
        name={selectedTemplate?.name || ""}
        price={selectedTemplate?.price || 0}
      />
    </div>
  );
}