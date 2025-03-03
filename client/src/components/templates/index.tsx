import React from 'react';
import { type ResumeContent } from '@shared/schema';
import { ModernTemplate } from './modern-template';
import { CreativeTemplate } from './creative-template';
import { ExecutiveTemplate } from './executive-template';
import { ElegantTemplate } from './elegant-template';
import { ProfessionalTemplate } from './professional-template';
import { PremiumTemplateWatermark } from '../premium-template-watermark';

export interface TemplateProps {
  content: ResumeContent;
  font?: string;
  colorScheme?: string;
  layoutStyle?: string;
  showBorders?: boolean;
  className?: string;
  scale?: number;
  isPremiumUser?: boolean;
  showWatermark?: boolean;
}

// Base template fallback for backward compatibility
export function BaseTemplate({ 
  content,
  font = "font-inter",
  colorScheme = "default",
  layoutStyle = "classic",
  showBorders = true,
  className = "",
  scale = 1,
  isPremiumUser = false,
  showWatermark = false
}: TemplateProps) {
  const { personalInfo, summary, experience, education, skills } = content;

  const getBackgroundColor = () => {
    switch (colorScheme) {
      case "default":
        return "bg-white border-blue-200";
      case "professional":
        return "bg-white border-gray-200";
      case "modern":
        return "bg-white border-teal-200";
      case "creative":
        return "bg-white border-purple-200";
      case "elegant":
        return "bg-white border-amber-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  const getTextColor = () => {
    switch (colorScheme) {
      case "default":
        return "text-blue-900";
      case "professional":
        return "text-gray-900";
      case "modern":
        return "text-teal-900";
      case "creative":
        return "text-purple-900";
      case "elegant":
        return "text-amber-900";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div 
      className={`w-full relative ${font} ${getBackgroundColor()} ${className}`} 
      style={{transform: `scale(${scale})`, transformOrigin: 'top center'}}
    >
      {showWatermark && (
        <PremiumTemplateWatermark templateName="Base Template" />
      )}
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-bold">{personalInfo?.fullName || 'Your Name'}</h1>
          <div className="flex flex-wrap mt-2 gap-3 text-sm text-gray-600">
            {personalInfo?.email && <p>{personalInfo.email}</p>}
            {personalInfo?.phone && <p>{personalInfo.phone}</p>}
            {personalInfo?.location && <p>{personalInfo.location}</p>}
          </div>
        </div>
        
        {summary && (
          <div className="space-y-2">
            <h2 className={`text-xl font-semibold ${getTextColor()}`}>Professional Summary</h2>
            {showBorders && <div className={`w-full h-px bg-current opacity-20`}></div>}
            <p className="whitespace-pre-wrap">{summary}</p>
          </div>
        )}
        
        {experience && (
          <div className="space-y-2">
            <h2 className={`text-xl font-semibold ${getTextColor()}`}>Work Experience</h2>
            {showBorders && <div className={`w-full h-px bg-current opacity-20`}></div>}
            <p className="whitespace-pre-wrap">{experience}</p>
          </div>
        )}
        
        {education && (
          <div className="space-y-2">
            <h2 className={`text-xl font-semibold ${getTextColor()}`}>Education</h2>
            {showBorders && <div className={`w-full h-px bg-current opacity-20`}></div>}
            <p className="whitespace-pre-wrap">{education}</p>
          </div>
        )}
        
        {skills && (
          <div className="space-y-2">
            <h2 className={`text-xl font-semibold ${getTextColor()}`}>Skills</h2>
            {showBorders && <div className={`w-full h-px bg-current opacity-20`}></div>}
            <p className="whitespace-pre-wrap">{skills}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Template registry mapping template IDs to their components and attributes
export const templateRegistry = {
  // Free Templates - Modern Category
  "modern-1": {
    name: "Modern Professional",
    component: ModernTemplate,
    premium: false,
    price: 0,
    category: "modern",
    description: "Clean, contemporary design with customizable accent colors"
  },
  "modern-2": {
    name: "Modern Minimalist",
    component: ModernTemplate,
    premium: false,
    price: 0,
    category: "modern",
    description: "Sleek, minimalist layout with ample whitespace"
  },
  "modern-3": {
    name: "Modern Tech",
    component: ModernTemplate,
    premium: false,
    price: 0,
    category: "modern",
    description: "Perfect for technical roles with emphasis on skills section"
  },
  
  // Free Templates - Creative Category
  "creative-1": {
    name: "Creative Classic",
    component: CreativeTemplate,
    premium: false,
    price: 0,
    category: "creative",
    description: "Artistic template with geometric accents and dynamic styling",
    colors: ["creative", "artistic", "minimal"]
  },
  "creative-2": {
    name: "Creative Portfolio",
    component: CreativeTemplate,
    premium: false,
    price: 0,
    category: "creative",
    description: "Showcase your creative work with style"
  },
  
  // Free Templates - Professional Category
  "professional-basic": {
    name: "Professional Basic",
    component: ProfessionalTemplate,
    premium: false,
    price: 0, 
    category: "professional",
    description: "Traditional resume layout optimized for ATS systems"
  },
  "basic-1": {
    name: "Simple Clean",
    component: BaseTemplate,
    premium: false,
    price: 0,
    category: "basic",
    description: "No-frills, straightforward layout that works for any industry"
  },
  "basic-2": {
    name: "Entry Level",
    component: BaseTemplate,
    premium: false,
    price: 0,
    category: "basic",
    description: "Perfect for students and early career professionals"
  },
  
  // Premium Templates - Executive Category
  "executive-1": {
    name: "Executive Elite",
    component: ExecutiveTemplate,
    premium: true,
    price: 499,
    category: "executive",
    description: "Sophisticated design for senior leadership positions"
  },
  "executive-2": {
    name: "C-Suite",
    component: ExecutiveTemplate,
    premium: true,
    price: 599,
    category: "executive",
    description: "Premium design for high-level executives and directors"
  },
  "executive-3": {
    name: "Corporate Leadership",
    component: ExecutiveTemplate,
    premium: true,
    price: 499,
    category: "executive",
    description: "Convey authority with this professional executive template"
  },
  
  // Premium Templates - Professional Category
  "professional-1": {
    name: "Professional Two-Column",
    component: ProfessionalTemplate,
    premium: true,
    price: 499,
    category: "professional",
    description: "Modern two-column layout with sidebar for skills and education"
  },
  "professional-2": {
    name: "Professional Advanced",
    component: ProfessionalTemplate,
    premium: true,
    price: 499,
    category: "professional",
    description: "Advanced layout with customizable sections and emphasis on work experience"
  },
  "professional-3": {
    name: "Professional Compact",
    component: ProfessionalTemplate,
    premium: true,
    price: 399,
    category: "professional",
    description: "Maximizes space efficiency without sacrificing readability"
  },
  
  // Premium Templates - Elegant Category
  "elegant-1": {
    name: "Elegant Premium",
    component: ElegantTemplate,
    premium: true,
    price: 599,
    category: "elegant",
    description: "Luxurious design with tasteful accents and refined typography"
  },
  "elegant-2": {
    name: "Elegant Serif",
    component: ElegantTemplate,
    premium: true,
    price: 599,
    category: "elegant",
    description: "Timeless elegance with classic serif typography"
  },
  
  // Premium Templates - Creative Category
  "creative-premium-1": {
    name: "Creative Portfolio",
    component: CreativeTemplate,
    premium: true,
    price: 499,
    category: "creative",
    description: "Premium artistic template with background patterns and timeline views",
    colors: ["vibrant", "bold", "warm"],
    new: true
  },
  "creative-premium-2": {
    name: "Creative Designer",
    component: CreativeTemplate,
    premium: true,
    price: 599,
    category: "creative",
    description: "Eye-catching design with custom accents and bold typography",
    colors: ["artistic", "creative", "vibrant"],
    new: true
  },
  "creative-premium-3": {
    name: "Creative Showcase",
    component: CreativeTemplate,
    premium: true,
    price: 699,
    category: "creative",
    description: "Unique showcase template with artistic styling and custom patterns",
    colors: ["bold", "warm", "vibrant"]
  },
  
  // Premium Templates - Specialized
  "tech-1": {
    name: "Tech Specialist",
    component: ModernTemplate,
    premium: true,
    price: 499,
    category: "specialized",
    description: "Optimized for software developers and IT professionals"
  },
  "academic-1": {
    name: "Academic CV",
    component: BaseTemplate,
    premium: true,
    price: 499,
    category: "specialized",
    description: "Comprehensive layout for academic and research positions"
  },
  "medical-1": {
    name: "Medical Professional",
    component: ProfessionalTemplate,
    premium: true,
    price: 599,
    category: "specialized",
    description: "Specialized template for healthcare professionals"
  },
  "legal-1": {
    name: "Legal Professional",
    component: ElegantTemplate,
    premium: true,
    price: 599,
    category: "specialized",
    description: "Tailored for legal professionals with appropriate formatting"
  },
  "consulting-1": {
    name: "Management Consultant",
    component: ExecutiveTemplate,
    premium: true,
    price: 499,
    category: "specialized",
    description: "Strategic layout for consultants and advisors"
  }
};

export type TemplateId = keyof typeof templateRegistry;

// Helper function to get template component by ID
export function getTemplateComponent(templateId: string): React.ComponentType<TemplateProps> {
  const template = templateRegistry[templateId as TemplateId];
  return template?.component || BaseTemplate;
}

// Helper function to get template display name
export function getTemplateName(templateId: string): string {
  const template = templateRegistry[templateId as TemplateId];
  return template?.name || "Basic Template";
}

// Helper function to check if template is premium
export function isTemplatePremium(templateId: string): boolean {
  const template = templateRegistry[templateId as TemplateId];
  return template?.premium || false;
}

// Helper function to get template price
export function getTemplatePrice(templateId: string): number {
  const template = templateRegistry[templateId as TemplateId];
  return template?.price || 0;
}

// Helper function to get template category
export function getTemplateCategory(templateId: string): string {
  const template = templateRegistry[templateId as TemplateId];
  return template?.category || "basic";
}

// Helper function to get template description
export function getTemplateDescription(templateId: string): string {
  const template = templateRegistry[templateId as TemplateId];
  return template?.description || "Basic resume template";
}

// Helper function to get all templates by category
export function getTemplatesByCategory(category: string, premiumUser: boolean = false): TemplateId[] {
  return Object.keys(templateRegistry).filter(id => {
    const template = templateRegistry[id as TemplateId];
    return template.category === category && (premiumUser || !template.premium);
  }) as TemplateId[];
}

// Helper function to get all template categories
export function getAllTemplateCategories(): string[] {
  const categories = new Set<string>();
  Object.values(templateRegistry).forEach(template => {
    if (template.category) {
      categories.add(template.category);
    }
  });
  return Array.from(categories);
} 