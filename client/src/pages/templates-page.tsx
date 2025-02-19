import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Palette, Star, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const templates = [
  {
    id: "modern-1",
    name: "Modern Professional",
    description: "Clean and minimal design with bold section headers",
    premium: false,
  },
  {
    id: "executive-1",
    name: "Executive",
    description: "Traditional format optimized for senior positions",
    premium: false,
  },
  {
    id: "creative-1",
    name: "Creative Portfolio",
    description: "Unique layout for creative professionals",
    premium: true,
  },
  {
    id: "technical-1",
    name: "Technical Specialist",
    description: "Focused on technical skills and projects",
    premium: true,
  },
  {
    id: "academic-1",
    name: "Academic CV",
    description: "Detailed format for academic positions",
    premium: true,
  },
  {
    id: "startup-1",
    name: "Startup Profile",
    description: "Modern design for startup environments",
    premium: true,
  },
  {
    id: "minimal-1",
    name: "Minimal",
    description: "Simple and elegant design",
    premium: false,
  },
  {
    id: "professional-2",
    name: "Corporate Professional",
    description: "Traditional corporate style with modern elements",
    premium: true,
  },
];

export default function TemplatesPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Resume Templates</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader className="relative">
                  <div className="aspect-[210/297] bg-gray-100 rounded-md flex items-center justify-center">
                    <Palette className="h-12 w-12 text-gray-400" />
                  </div>
                  {template.premium && (
                    <div className="absolute top-3 right-3">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    asChild
                    variant={template.premium && !user?.isPremium ? "secondary" : "default"}
                    disabled={template.premium && !user?.isPremium}
                  >
                    <Link href={`/generator?template=${template.id}`}>
                      {template.premium && !user?.isPremium
                        ? "Premium Template"
                        : "Use Template"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
