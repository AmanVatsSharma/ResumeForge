import React from 'react';
import { type ResumeContent } from '@shared/schema';
import { ModernTemplate } from './modern-template';
import { CreativeTemplate } from './creative-template';
import { ExecutiveTemplate } from './executive-template';
import { ElegantTemplate } from './elegant-template';
import { ProfessionalTemplate } from './professional-template';
import { PremiumTemplateWatermark } from '../premium-template-watermark';
import { TEMPLATES, TEMPLATE_MAP, type TemplateMeta, TEMPLATE_CATEGORIES } from '@shared/templates';

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
const componentMap: Record<TemplateMeta["componentKey"], React.ComponentType<TemplateProps>> = {
  base: BaseTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate,
  professional: ProfessionalTemplate,
  executive: ExecutiveTemplate,
  elegant: ElegantTemplate,
};

// Build registry from shared catalog to ensure no duplicates and consistent pricing/metadata
export const templateRegistry = Object.fromEntries(
  TEMPLATES.map((t) => [
    t.id,
    {
      name: t.name,
      component: componentMap[t.componentKey] || BaseTemplate,
      premium: t.premium,
      price: t.price,
      category: t.category,
      description: t.description,
    },
  ])
) as Record<string, { name: string; component: React.ComponentType<TemplateProps>; premium: boolean; price: number; category: string; description: string }>;

export type TemplateId = keyof typeof templateRegistry;

// Helper function to get template component by ID
export function getTemplateComponent(templateId: string): React.ComponentType<TemplateProps> {
  const template = templateRegistry[templateId as TemplateId];
  return template?.component || BaseTemplate;
}

// Helper function to get template display name
export function getTemplateName(templateId: string): string {
  const t = TEMPLATE_MAP[templateId] || undefined;
  return t?.name || (templateRegistry[templateId as TemplateId]?.name ?? "Basic Template");
}

// Helper function to check if template is premium
export function isTemplatePremium(templateId: string): boolean {
  const t = TEMPLATE_MAP[templateId] || undefined;
  return t?.premium ?? (templateRegistry[templateId as TemplateId]?.premium || false);
}

// Helper function to get template price
export function getTemplatePrice(templateId: string): number {
  const t = TEMPLATE_MAP[templateId] || undefined;
  return t?.price ?? (templateRegistry[templateId as TemplateId]?.price || 0);
}

// Helper function to get template category
export function getTemplateCategory(templateId: string): string {
  const t = TEMPLATE_MAP[templateId] || undefined;
  return t?.category ?? (templateRegistry[templateId as TemplateId]?.category || "basic");
}

// Helper function to get template description
export function getTemplateDescription(templateId: string): string {
  const t = TEMPLATE_MAP[templateId] || undefined;
  return t?.description ?? (templateRegistry[templateId as TemplateId]?.description || "Basic resume template");
}

// Helper function to get all templates by category
export function getTemplatesByCategory(category: string, premiumUser: boolean = false): TemplateId[] {
  return (TEMPLATES.filter(t => t.category === category && (premiumUser || !t.premium)).map(t => t.id)) as TemplateId[];
}

// Helper function to get all template categories
export function getAllTemplateCategories(): string[] {
  return TEMPLATE_CATEGORIES as unknown as string[];
} 