import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Resume, type ResumeContent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportDialog } from "@/components/export-dialog";
import { ModernTemplate } from "@/components/templates/modern-template";
import { CreativeTemplate } from "@/components/templates/creative-template";
import { ExecutiveTemplate } from "@/components/templates/executive-template";

// Import the template components (same as in resume-page.tsx)
function BaseTemplate({ content, font = 'font-inter', colorScheme = 'default', layoutStyle = 'classic', showBorders = true, className = '' }: { 
  content: ResumeContent;
  font?: string;
  colorScheme?: string;
  layoutStyle?: string;
  showBorders?: boolean;
  className?: string;
}) {
  return (
    <div className="max-w-[21cm] mx-auto bg-white p-8 shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{content.personalInfo.fullName}</h1>
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
        <div className="text-gray-700 whitespace-pre-wrap">{content.experience}</div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">
          Education
        </h2>
        <div className="text-gray-700 whitespace-pre-wrap">{content.education}</div>
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

// Define template components
const TechnicalTemplate = BaseTemplate;
const AcademicTemplate = BaseTemplate;
const MinimalTemplate = BaseTemplate;

// Template definitions
const templates = {
  "modern-1": {
    name: "Modern Professional",
    component: ModernTemplate,
  },
  "executive-1": {
    name: "Executive",
    component: ExecutiveTemplate,
  },
  "creative-1": {
    name: "Creative Portfolio",
    component: CreativeTemplate,
  },
  "technical-1": {
    name: "Technical Specialist",
    component: TechnicalTemplate,
  },
  "academic-1": {
    name: "Academic CV",
    component: AcademicTemplate,
  },
  "minimal-1": {
    name: "Minimal",
    component: MinimalTemplate,
  }
} as const;

type TemplateId = keyof typeof templates;

export default function ShareViewPage() {
  const { shareId } = useParams();
  const [showExportDialog, setShowExportDialog] = useState(false);

  const { data: resume, isLoading, error } = useQuery<Resume>({
    queryKey: [`/api/shares/${shareId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white shadow dark:bg-gray-800 dark:shadow-gray-700/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild disabled>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <Skeleton className="h-8 w-40" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="max-w-[21cm] mx-auto">
                <Skeleton className="h-12 w-1/2 mx-auto mb-4" />
                <div className="flex flex-col items-center gap-2 mb-8">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-24 w-full mb-8" />
                
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-32 w-full mb-8" />
                
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-24 w-full mb-8" />
                
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!resume || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Resume not found or no longer available
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The shared resume you're looking for may have been removed or the link is invalid.
        </p>
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  const Template = templates[resume.templateId as TemplateId]?.component || ModernTemplate;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800 dark:shadow-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{resume.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Shared Resume</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6">
            <div>
              <Template content={resume.content} />
            </div>
          </CardContent>
        </Card>
      </main>

      {resume && (
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          resumeContent={resume.content}
          templateId={resume.templateId}
          templateConfig={{
            font: 'font-inter',
            colorScheme: 'default',
            layoutStyle: 'classic',
            showBorders: true
          }}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
} 