import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Resume } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Download, Share2 } from "lucide-react";
import { Link } from "wouter";

const templates = {
  "modern-1": {
    name: "Modern Professional",
    component: ModernTemplate,
  },
  "executive-1": {
    name: "Executive",
    component: ModernTemplate, // Fallback to modern for now
  },
  "minimal-1": {
    name: "Minimal",
    component: ModernTemplate, // Fallback to modern for now
  },
};

function ModernTemplate({ content }: { content: Resume["content"] }) {
  return (
    <div className="max-w-[21cm] mx-auto bg-white p-8 shadow-lg">
      {/* Personal Info Section */}
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

      {/* Summary Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
          Professional Summary
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">{content.summary}</p>
      </div>

      {/* Experience Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
          Experience
        </h2>
        <div className="text-gray-700 whitespace-pre-wrap">
          {content.experience}
        </div>
      </div>

      {/* Education Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
          Education
        </h2>
        <div className="text-gray-700 whitespace-pre-wrap">
          {content.education}
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
          Skills
        </h2>
        <div className="text-gray-700 whitespace-pre-wrap">{content.skills}</div>
      </div>
    </div>
  );
}

export default function ResumePage() {
  const { id } = useParams();
  const { data: resume, isLoading } = useQuery<Resume>({
    queryKey: [`/api/resumes/${id}`],
  });

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
            <div className="flex gap-2">
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
    </div>
  );
}
