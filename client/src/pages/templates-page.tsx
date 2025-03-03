import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Palette, Star, ChevronLeft, Check, Lock, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { analytics } from "@/lib/analytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getTemplatesByCategory, getAllTemplateCategories, getTemplateCategory, getTemplateDescription } from "@/components/templates";

/**
 * Template interface representing a resume template
 * @interface Template
 */
interface Template {
  id: string;
  name: string;
  description: string;
  premium: boolean;
  preview: string;
  colors?: string[];
  new?: boolean;
  category?: string;
  price?: number;
}

/**
 * Available color themes for templates
 */
const colorThemes = {
  blue: "#3b82f6",
  purple: "#8b5cf6",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f97316",
  teal: "#14b8a6",
  indigo: "#6366f1",
  gray: "#6b7280",
};

/**
 * Template data for all resume templates
 */
const templates: Template[] = [
  {
    id: "modern-pro",
    name: "Modern Professional Plus",
    description: "Enhanced modern design with customizable colors and sections",
    premium: false,
    preview: "modern-pro.svg",
    colors: Object.keys(colorThemes),
    new: true,
  },
  {
    id: "elegant-1",
    name: "Elegant Premium",
    description: "Sophisticated design with premium styling and advanced customization",
    premium: true,
    preview: "elegant-premium.svg",
    colors: ["purple", "blue", "teal", "gray"],
    new: true,
  },
  {
    id: "professional-1",
    name: "Professional Two-Column",
    description: "Modern two-column layout with sidebar and advanced section controls",
    premium: true,
    preview: "professional-column.svg",
    colors: ["blue", "gray", "indigo", "teal"],
    new: true,
  },
  {
    id: "modern-1",
    name: "Modern Professional",
    description: "Clean and minimal design with bold section headers",
    premium: false,
    preview: "minimal-light.svg",
  },
  {
    id: "executive-1",
    name: "Executive",
    description: "Traditional format optimized for senior positions",
    premium: false,
    preview: "executive-dark.svg",
  },
  {
    id: "creative-1",
    name: "Creative Portfolio",
    description: "Unique layout for creative professionals",
    premium: true,
    preview: "creative-color.svg",
    colors: ["purple", "indigo", "teal", "orange"],
  },
  {
    id: "technical-1",
    name: "Technical Specialist",
    description: "Focused on technical skills and projects",
    premium: true,
    preview: "technical-grid.svg",
    colors: ["blue", "gray", "indigo", "green"],
  },
  {
    id: "academic-1",
    name: "Academic CV",
    description: "Detailed format for academic positions",
    premium: true,
    preview: "academic-formal.svg",
  },
  {
    id: "startup-1",
    name: "Startup Profile",
    description: "Modern design for startup environments",
    premium: true,
    preview: "startup-modern.svg",
    colors: ["green", "blue", "purple", "red"],
  },
  {
    id: "minimal-1",
    name: "Minimal",
    description: "Simple and elegant design",
    premium: false,
    preview: "minimal-clean.svg",
  },
  {
    id: "professional-2",
    name: "Corporate Professional",
    description: "Traditional corporate style with modern elements",
    premium: true,
    preview: "corporate-pro.svg",
  },
  {
    id: "creative-2",
    name: "Digital Creative",
    description: "Modern design for digital professionals",
    premium: true,
    preview: "digital-creative.svg",
    colors: ["blue", "purple", "green", "orange"],
  },
  {
    id: "minimal-2",
    name: "Clean Professional",
    description: "Clean and professional layout",
    premium: false,
    preview: "clean-pro.svg",
  }
];

/**
 * Templates Page Component
 * Displays available resume templates and allows users to select and customize them
 * 
 * @component
 * @returns {JSX.Element} The templates page component
 */
export default function TemplatesPage() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("blue");
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const [selectedPremiumTemplate, setSelectedPremiumTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user: authUser } = useAuth();
  const [, navigate] = useLocation();
  
  // New state for category filtering
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Load favorites from local storage
  useEffect(() => {
    const storedFavorites = localStorage.getItem("templateFavorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Get all categories from the template registry
  const categories = ["all", ...getAllTemplateCategories()];
  
  // Filter templates based on selected category and search query
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      const matchesSearch = searchQuery === "" || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, templates]);

  // Group templates by category for the grid display
  const templatesByCategory = useMemo(() => {
    if (selectedCategory !== "all") {
      return { [selectedCategory]: filteredTemplates };
    }
    
    const grouped: Record<string, Template[]> = {};
    filteredTemplates.forEach(template => {
      const category = template.category || "uncategorized";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(template);
    });
    return grouped;
  }, [selectedCategory, filteredTemplates]);

  const toggleFavorite = (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    let newFavorites: string[];
    if (favorites.includes(templateId)) {
      newFavorites = favorites.filter(id => id !== templateId);
      } else {
      newFavorites = [...favorites, templateId];
      }
    
    setFavorites(newFavorites);
    localStorage.setItem("templateFavorites", JSON.stringify(newFavorites));
    
    analytics.track("Template Favorited", {
      templateId,
      action: favorites.includes(templateId) ? "unfavorite" : "favorite"
    });
  };

  const handleTemplateSelect = (template: Template) => {
    if (template.premium && !authUser?.isPremium) {
      // Show premium upgrade dialog for premium templates
      setSelectedPremiumTemplate(template);
      setIsPremiumDialogOpen(true);
      
      analytics.track("Premium Template Selected", {
        templateId: template.id,
        templateName: template.name
      });
    } else {
      // Set the selected template and proceed
      setSelectedTemplate(template);
      
      analytics.track("Template Selected", {
        templateId: template.id,
        templateName: template.name,
        isPremium: template.premium
      });
    }
  };

  const handleProceed = () => {
    if (!selectedTemplate) return;
    
    setIsLoading(true);
    
    // Create query params
    const params = new URLSearchParams();
    params.append("template", selectedTemplate.id);
    
    // Navigate to the generator page with the selected template
    navigate(`/generator?${params.toString()}`);
  };
  
  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
  };
  
  // Render categories list
  const renderCategoryFilters = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(category)}
            className="capitalize"
          >
            {category === "all" ? "All Templates" : category}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Resume Templates</h1>
          <p className="text-gray-600 mb-4 md:mb-0">
            Choose from our professionally designed templates to kickstart your resume
          </p>
        </div>
        <Button
          variant="ghost"
          className="flex items-center"
          onClick={() => navigate("/")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
      
      {/* Search and Category Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={`${favorites.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={favorites.length === 0}
            >
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </Button>
            
            {authUser?.isPremium ? (
              <Badge variant="default" className="ml-2 bg-gradient-to-r from-yellow-400 to-amber-600">
                Premium Access
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2">
                Free Plan
              </Badge>
            )}
          </div>
        </div>
        
        {renderCategoryFilters()}
      </div>

      {/* Templates Display */}
      {Object.entries(templatesByCategory).length > 0 ? (
        <div className="space-y-10">
          {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold capitalize border-b pb-2">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTemplates.map(template => (
                  <TemplateCard 
                    key={template.id}
                    template={template}
                    isFavorite={favorites.includes(template.id)}
                    onSelect={handleTemplateSelect}
                    onToggleFavorite={toggleFavorite}
                    isPremiumUser={authUser?.isPremium || false}
                  />
                ))}
            </div>
          </div>
            ))}
          </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No templates match your search criteria.</p>
        </div>
      )}

      {/* Template Selection Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Template Selected</DialogTitle>
            <DialogDescription>
              You've selected the {selectedTemplate?.name} template.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              Would you like to start creating your resume with this template?
            </p>
            <div className="flex justify-center">
              <img 
                src={selectedTemplate?.preview} 
                alt={selectedTemplate?.name}
                className="h-40 object-contain border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedTemplate(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceed}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Proceed"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Premium Template Dialog */}
      <Dialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Premium Template</DialogTitle>
            <DialogDescription>
              This is a premium template that requires an upgrade.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-4 rounded-lg mb-4 w-full">
              <h3 className="text-amber-800 font-medium text-lg mb-2 flex items-center">
                <Crown className="h-5 w-5 mr-2 text-amber-600" />
                {selectedPremiumTemplate?.name}
              </h3>
              <p className="text-amber-700 text-sm mb-4">
                {selectedPremiumTemplate?.description || "Premium template with advanced features"}
              </p>
              <div className="flex justify-between items-center">
                <Badge className="bg-amber-500 hover:bg-amber-600">Premium</Badge>
                <span className="text-amber-900 font-medium">
                  ₹{(selectedPremiumTemplate?.price || 499) / 100}
                </span>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mb-4">
              Upgrade to Premium to access all premium templates, AI features, and export options.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPremiumDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle premium upgrade
                navigate("/pricing");
              }}
            >
              Upgrade to Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: Template;
  isFavorite: boolean;
  onSelect: (template: Template) => void;
  onToggleFavorite: (id: string, event: React.MouseEvent) => void;
  isPremiumUser: boolean;
}

function TemplateCard({ template, isFavorite, onSelect, onToggleFavorite, isPremiumUser }: TemplateCardProps) {
  return (
    <Card 
      className={`overflow-hidden transition-all hover:shadow-md cursor-pointer group ${
        template.premium && !isPremiumUser ? 'opacity-80' : ''
      }`}
      onClick={() => onSelect(template)}
    >
      <CardContent className="p-0 relative">
        <div className="h-48 bg-gray-100 flex items-center justify-center p-4 overflow-hidden">
          <img 
            src={template.preview} 
            alt={template.name}
            className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
          />
          
      {template.new && (
            <Badge 
              variant="default" 
              className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600"
            >
          New
            </Badge>
      )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
                  className={`absolute top-2 right-2 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500 hover:bg-transparent`}
            onClick={(e) => onToggleFavorite(template.id, e)}
          >
                  <Star className="h-5 w-5 fill-current" />
          </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {template.premium && !isPremiumUser && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <Badge variant="outline" className="bg-white text-black font-semibold py-1 px-3">
                Premium
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium mb-1">{template.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{template.description || "Professional resume template"}</p>
            </div>
            
            {template.premium ? (
              <Badge className="bg-gradient-to-r from-yellow-400 to-amber-600 ml-2 whitespace-nowrap">
                Premium
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 whitespace-nowrap">
                Free
              </Badge>
            )}
          </div>
          
        {template.colors && (
            <div className="flex mt-3 gap-1">
              {template.colors.map(color => (
                <div 
                  key={color} 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: colorThemes[color as keyof typeof colorThemes] }}
                />
              ))}
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
}