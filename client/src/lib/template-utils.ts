import { type ResumeContent } from '@shared/schema';

// Font options for resume templates
export const fontOptions = [
  { id: 'inter', name: 'Inter', className: 'font-inter' },
  { id: 'poppins', name: 'Poppins', className: 'font-poppins' },
  { id: 'roboto', name: 'Roboto', className: 'font-roboto' },
  { id: 'opensans', name: 'Open Sans', className: 'font-opensans' },
  { id: 'montserrat', name: 'Montserrat', className: 'font-montserrat' },
  { id: 'lato', name: 'Lato', className: 'font-lato' },
  { id: 'playfair', name: 'Playfair Display', className: 'font-playfair' },
  { id: 'merriweather', name: 'Merriweather', className: 'font-merriweather' },
  { id: 'oswald', name: 'Oswald', className: 'font-oswald' },
  { id: 'raleway', name: 'Raleway', className: 'font-raleway' },
  { id: 'quicksand', name: 'Quicksand', className: 'font-quicksand' },
  { id: 'sourcesans', name: 'Source Sans Pro', className: 'font-sourcesans' }
];

// Color scheme options for templates
export const colorSchemes = [
  { id: 'default', name: 'Classic Blue', primary: 'bg-blue-600', secondary: 'bg-blue-100', text: 'text-blue-900', accent: 'border-blue-300' },
  { id: 'professional', name: 'Professional Gray', primary: 'bg-gray-700', secondary: 'bg-gray-100', text: 'text-gray-900', accent: 'border-gray-300' },
  { id: 'modern', name: 'Modern Teal', primary: 'bg-teal-600', secondary: 'bg-teal-50', text: 'text-teal-900', accent: 'border-teal-300' },
  { id: 'creative', name: 'Creative Purple', primary: 'bg-purple-600', secondary: 'bg-purple-50', text: 'text-purple-900', accent: 'border-purple-300' },
  { id: 'elegant', name: 'Elegant Emerald', primary: 'bg-emerald-600', secondary: 'bg-emerald-50', text: 'text-emerald-900', accent: 'border-emerald-300' },
  { id: 'bold', name: 'Bold Red', primary: 'bg-red-600', secondary: 'bg-red-50', text: 'text-red-900', accent: 'border-red-300' },
  { id: 'minimal', name: 'Minimal Black', primary: 'bg-black', secondary: 'bg-gray-50', text: 'text-gray-900', accent: 'border-gray-300' },
  { id: 'warm', name: 'Warm Orange', primary: 'bg-orange-500', secondary: 'bg-orange-50', text: 'text-orange-900', accent: 'border-orange-300' },
  { id: 'forest', name: 'Forest Green', primary: 'bg-green-700', secondary: 'bg-green-50', text: 'text-green-900', accent: 'border-green-300' },
  { id: 'ocean', name: 'Ocean Blue', primary: 'bg-blue-400', secondary: 'bg-blue-50', text: 'text-blue-900', accent: 'border-blue-200' },
  { id: 'sunset', name: 'Sunset', primary: 'bg-pink-500', secondary: 'bg-orange-50', text: 'text-pink-900', accent: 'border-pink-300' },
  { id: 'monochrome', name: 'Monochrome', primary: 'bg-gray-800', secondary: 'bg-gray-100', text: 'text-gray-900', accent: 'border-gray-300' }
];

// Layout style options for templates
export const layoutStyles = [
  { id: 'classic', name: 'Classic', description: 'Traditional resume layout with section headers' },
  { id: 'modern', name: 'Modern', description: 'Clean, minimalist design with ample whitespace' },
  { id: 'compact', name: 'Compact', description: 'Maximizes space to fit more content' },
  { id: 'creative', name: 'Creative', description: 'Unique design for creative professionals' },
  { id: 'executive', name: 'Executive', description: 'Sophisticated design for senior positions' },
  { id: 'technical', name: 'Technical', description: 'Optimized for technical roles and skills' },
  { id: 'chronological', name: 'Chronological', description: 'Emphasizes work history in chronological order' },
  { id: 'functional', name: 'Functional', description: 'Focuses on skills and abilities rather than timeline' },
  { id: 'hybrid', name: 'Hybrid', description: 'Combines chronological and functional approaches' },
  { id: 'academic', name: 'Academic', description: 'Formatted for academic and research positions' }
];

// Spacing options for templates
export const spacingOptions = [
  { id: 'compact', name: 'Compact', description: 'Minimized spacing to fit more content', premium: false, icon: '▪️' },
  { id: 'comfortable', name: 'Comfortable', description: 'Balanced spacing for readability', premium: false, icon: '◽' },
  { id: 'spacious', name: 'Spacious', description: 'More whitespace for elegant appearance', premium: true, icon: '◻️' },
  { id: 'conservative', name: 'Conservative', description: 'Traditional spacing for formal contexts', premium: true, icon: '🔳' },
  { id: 'modern', name: 'Modern', description: 'Contemporary spacing with emphasis on headers', premium: true, icon: '▫️' },
  { id: 'custom', name: 'Custom', description: 'Your personalized spacing settings', premium: true, icon: '⚙️' }
];

// Extended template configuration interface
export interface ExtendedTemplateConfig {
  font: string;
  colorScheme: string;
  layoutStyle: string;
  showBorders: boolean;
  customColor?: string;
  fontSizeHeading?: number;
  fontSizeBody?: number;
  fontWeight?: 'light' | 'normal' | 'medium' | 'bold';
  spacingScale?: number;
  spacingSections?: number;
  spacingElements?: number;
  pageMargin?: 'narrow' | 'normal' | 'wide';
  spacingPreset?: string;
  useColumns?: boolean;
  sectionOrder?: string[];
  sectionAlignment?: {
    [key: string]: 'left' | 'center' | 'right' | undefined;
    summary?: 'left' | 'center' | 'right';
    experience?: 'left' | 'center' | 'right';
    education?: 'left' | 'center' | 'right';
    skills?: 'left' | 'center' | 'right';
  };
  useAccentSidebar?: boolean;
  sidebarWidth?: 'narrow' | 'medium' | 'wide';
  sidebarPosition?: 'left' | 'right';
  useIcons?: boolean;
  primarySections?: string[];
  secondarySections?: string[];
  useDividers?: boolean;
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
}

// Function to get default template configuration
export function getDefaultTemplateConfig(templateId: string): ExtendedTemplateConfig {
  // Default values based on template type
  switch (templateId) {
    case 'modern-1':
      return {
        font: 'inter',
        colorScheme: 'modern',
        layoutStyle: 'modern',
        showBorders: false,
        spacingPreset: 'comfortable',
        fontSizeHeading: 100,
        fontSizeBody: 100,
        fontWeight: 'normal',
        spacingScale: 100,
        spacingSections: 100,
        spacingElements: 100,
        pageMargin: 'normal',
        useColumns: false
      };
    case 'executive-1':
      return {
        font: 'montserrat',
        colorScheme: 'professional',
        layoutStyle: 'executive',
        showBorders: true,
        spacingPreset: 'conservative',
        fontSizeHeading: 110,
        fontSizeBody: 95,
        fontWeight: 'medium',
        spacingScale: 95,
        spacingSections: 90,
        spacingElements: 100,
        pageMargin: 'wide',
        useColumns: true
      };
    case 'creative-1':
      return {
        font: 'playfair',
        colorScheme: 'creative',
        layoutStyle: 'creative',
        showBorders: false,
        spacingPreset: 'modern',
        fontSizeHeading: 120,
        fontSizeBody: 100,
        fontWeight: 'normal',
        spacingScale: 110,
        spacingSections: 120,
        spacingElements: 110,
        pageMargin: 'narrow',
        useColumns: true
      };
    case 'technical-1':
      return {
        font: 'roboto',
        colorScheme: 'default',
        layoutStyle: 'technical',
        showBorders: true,
        spacingPreset: 'compact',
        fontSizeHeading: 95,
        fontSizeBody: 90,
        fontWeight: 'normal',
        spacingScale: 90,
        spacingSections: 85,
        spacingElements: 90,
        pageMargin: 'narrow',
        useColumns: true
      };
    case 'academic-1':
      return {
        font: 'merriweather',
        colorScheme: 'minimal',
        layoutStyle: 'classic',
        showBorders: true,
        spacingPreset: 'comfortable',
        fontSizeHeading: 105,
        fontSizeBody: 95,
        fontWeight: 'normal',
        spacingScale: 100,
        spacingSections: 100,
        spacingElements: 100,
        pageMargin: 'normal',
        useColumns: false
      };
    case 'minimal-1':
      return {
        font: 'inter',
        colorScheme: 'minimal',
        layoutStyle: 'modern',
        showBorders: false,
        spacingPreset: 'spacious',
        fontSizeHeading: 110,
        fontSizeBody: 100,
        fontWeight: 'light',
        spacingScale: 115,
        spacingSections: 120,
        spacingElements: 110,
        pageMargin: 'normal',
        useColumns: false
      };
    case 'elegant-1':
      return {
        font: 'playfair',
        colorScheme: 'elegant',
        layoutStyle: 'modern',
        showBorders: true,
        spacingPreset: 'spacious',
        fontSizeHeading: 115,
        fontSizeBody: 100,
        fontWeight: 'normal',
        spacingScale: 110,
        spacingSections: 120,
        spacingElements: 110,
        pageMargin: 'normal',
        useColumns: false,
        sectionOrder: ['summary', 'experience', 'education', 'skills'],
        sectionAlignment: {
          summary: 'center',
          experience: 'left',
          education: 'left',
          skills: 'left'
        },
        useAccentSidebar: false,
        useIcons: true,
        useDividers: true,
        dividerStyle: 'solid'
      };
    case 'professional-1':
      return {
        font: 'montserrat',
        colorScheme: 'professional',
        layoutStyle: 'professional',
        showBorders: true,
        spacingPreset: 'comfortable',
        fontSizeHeading: 105,
        fontSizeBody: 95,
        fontWeight: 'medium',
        spacingScale: 100,
        spacingSections: 100,
        spacingElements: 100,
        pageMargin: 'normal',
        useColumns: true,
        sectionOrder: ['summary', 'experience', 'education', 'skills'],
        sectionAlignment: {
          summary: 'left',
          experience: 'left',
          education: 'left',
          skills: 'left'
        },
        useAccentSidebar: true,
        sidebarWidth: 'medium',
        useIcons: true,
        primarySections: ['summary', 'experience'],
        secondarySections: ['education', 'skills'],
        useDividers: true,
        dividerStyle: 'solid'
      };
    default:
      return {
        font: 'inter',
        colorScheme: 'default',
        layoutStyle: 'classic',
        showBorders: true,
        spacingPreset: 'comfortable',
        fontSizeHeading: 100,
        fontSizeBody: 100,
        fontWeight: 'normal',
        spacingScale: 100,
        spacingSections: 100,
        spacingElements: 100,
        pageMargin: 'normal',
        useColumns: false,
        sectionOrder: ['summary', 'experience', 'education', 'skills'],
        sectionAlignment: {
          summary: 'left',
          experience: 'left',
          education: 'left',
          skills: 'left'
        },
        useAccentSidebar: false,
        useIcons: false,
        useDividers: false,
        dividerStyle: 'solid'
      };
  }
}

// Function to generate class names based on template configuration
export function getTemplateClasses(templateConfig: ExtendedTemplateConfig) {
  const font = fontOptions.find(f => f.id === templateConfig.font)?.className || 'font-inter';
  const colorScheme = colorSchemes.find(c => c.id === templateConfig.colorScheme) || colorSchemes[0];
  
  // Font size classes
  const fontSizeHeadingClass = getFontSizeClass(templateConfig.fontSizeHeading || 100, 'heading');
  const fontSizeBodyClass = getFontSizeClass(templateConfig.fontSizeBody || 100, 'body');
  
  // Font weight class
  const fontWeightClass = getFontWeightClass(templateConfig.fontWeight || 'normal');
  
  // Spacing classes
  const spacingClass = getSpacingClass(templateConfig.spacingScale || 100);
  const marginClass = getMarginClass(templateConfig.pageMargin || 'normal');
  
  // Handle custom colors
  let primary = colorScheme.primary;
  let secondary = colorScheme.secondary;
  let text = colorScheme.text;
  let accent = colorScheme.accent;
  
  if (templateConfig.colorScheme === 'custom' && templateConfig.customColor) {
    // For custom colors, we'd need more sophisticated handling
    // This is a simplified approach
    primary = `bg-[${templateConfig.customColor}]`;
    secondary = 'bg-gray-50';
    text = 'text-gray-900';
    accent = 'border-gray-300';
  }
  
  return {
    font,
    primary,
    secondary,
    text,
    accent,
    fontSizeHeading: fontSizeHeadingClass,
    fontSizeBody: fontSizeBodyClass,
    fontWeight: fontWeightClass,
    spacing: spacingClass,
    margin: marginClass
  };
}

// Helper function to get font size class based on percentage
function getFontSizeClass(percentage: number, type: 'heading' | 'body'): string {
  if (type === 'heading') {
    if (percentage <= 80) return 'text-lg md:text-xl';
    if (percentage <= 90) return 'text-xl md:text-2xl';
    if (percentage <= 110) return 'text-2xl md:text-3xl';
    if (percentage <= 120) return 'text-3xl md:text-4xl';
    return 'text-3xl md:text-5xl';
  } else {
    if (percentage <= 80) return 'text-xs md:text-sm';
    if (percentage <= 90) return 'text-sm';
    if (percentage <= 110) return 'text-base';
    if (percentage <= 120) return 'text-lg';
    return 'text-xl';
  }
}

// Helper function to get font weight class
function getFontWeightClass(weight: string): string {
  switch (weight) {
    case 'light': return 'font-light';
    case 'medium': return 'font-medium';
    case 'bold': return 'font-bold';
    default: return 'font-normal';
  }
}

// Helper function to get spacing class based on percentage
function getSpacingClass(percentage: number): string {
  if (percentage <= 80) return 'space-y-1';
  if (percentage <= 90) return 'space-y-2';
  if (percentage <= 110) return 'space-y-4';
  if (percentage <= 120) return 'space-y-6';
  return 'space-y-8';
}

// Helper function to get margin class based on setting
function getMarginClass(margin: string): string {
  switch (margin) {
    case 'narrow': return 'p-3 md:p-5';
    case 'wide': return 'p-8 md:p-12';
    default: return 'p-5 md:p-8';
  }
}

// Function to apply spacing preset
export function applySpacingPreset(config: ExtendedTemplateConfig, presetId: string): ExtendedTemplateConfig {
  switch (presetId) {
    case 'compact':
      return {
        ...config,
        spacingPreset: presetId,
        spacingScale: 85,
        spacingSections: 80,
        spacingElements: 85,
        pageMargin: 'narrow'
      };
    case 'comfortable':
      return {
        ...config,
        spacingPreset: presetId,
        spacingScale: 100,
        spacingSections: 100,
        spacingElements: 100,
        pageMargin: 'normal'
      };
    case 'spacious':
      return {
        ...config,
        spacingPreset: presetId,
        spacingScale: 115,
        spacingSections: 120,
        spacingElements: 110,
        pageMargin: 'normal'
      };
    case 'conservative':
      return {
        ...config,
        spacingPreset: presetId,
        spacingScale: 95,
        spacingSections: 100,
        spacingElements: 90,
        pageMargin: 'wide'
      };
    case 'modern':
      return {
        ...config,
        spacingPreset: presetId,
        spacingScale: 105,
        spacingSections: 110,
        spacingElements: 95,
        pageMargin: 'narrow'
      };
    default:
      return config;
  }
}

// Function to get a template design preview configuration
export function getTemplatePreviewConfig(config: ExtendedTemplateConfig): ExtendedTemplateConfig {
  // For preview purposes, we want to emphasize certain aspects
  return {
    ...config,
    showBorders: true, // Always show borders in preview for better visualization
  };
} 