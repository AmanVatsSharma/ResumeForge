import React from 'react';
import { type ResumeContent } from '@shared/schema';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PremiumTemplateWatermark } from '../premium-template-watermark';

interface TemplateProps {
  content: ResumeContent;
  font?: string;
  colorScheme?: string;
  layoutStyle?: string;
  showBorders?: boolean;
  className?: string;
  scale?: number;
  sectionOrder?: string[];
  sectionAlignment?: {
    summary?: 'left' | 'center' | 'right',
    experience?: 'left' | 'center' | 'right',
    education?: 'left' | 'center' | 'right',
    skills?: 'left' | 'center' | 'right'
  };
  useGradient?: boolean;
  useShadows?: boolean;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'underline';
  borderWidth?: 'thin' | 'medium' | 'thick';
  headerStyle?: 'minimal' | 'standard' | 'prominent' | 'elegant';
  headerAlignment?: 'left' | 'center' | 'right';
  isPremiumUser?: boolean;
  showWatermark?: boolean;
}

export function ElegantTemplate({
  content,
  font = 'font-raleway',
  colorScheme = 'elegant',
  layoutStyle = 'elegant',
  showBorders = true,
  className = '',
  scale = 1,
  sectionOrder = ['summary', 'experience', 'education', 'skills'],
  sectionAlignment = {
    summary: 'left',
    experience: 'left',
    education: 'left',
    skills: 'left'
  },
  useGradient = true,
  useShadows = true,
  borderStyle = 'solid',
  borderWidth = 'medium',
  headerStyle = 'elegant',
  headerAlignment = 'center',
  isPremiumUser = false,
  showWatermark = false
}: TemplateProps) {
  const { personalInfo, summary, experience, education, skills } = content;
  
  // Define the color palette based on the color scheme
  const getColorStyles = () => {
    switch (colorScheme) {
      case 'elegant':
        return {
          headerBg: useGradient 
            ? 'bg-gradient-to-r from-slate-700 to-slate-900' 
            : 'bg-slate-800',
          headerText: 'text-white',
          accent: 'text-emerald-600',
          accentBg: 'bg-emerald-600',
          accentLight: 'bg-emerald-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          subheading: 'text-slate-900',
          shadowColor: 'shadow-emerald-100'
        };
      case 'luxe':
        return {
          headerBg: useGradient 
            ? 'bg-gradient-to-r from-amber-700 to-amber-900' 
            : 'bg-amber-800',
          headerText: 'text-white',
          accent: 'text-amber-600',
          accentBg: 'bg-amber-600',
          accentLight: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          subheading: 'text-amber-950',
          shadowColor: 'shadow-amber-100'
        };
      case 'royal':
        return {
          headerBg: useGradient 
            ? 'bg-gradient-to-r from-indigo-700 to-purple-900' 
            : 'bg-indigo-800',
          headerText: 'text-white',
          accent: 'text-indigo-600',
          accentBg: 'bg-indigo-600',
          accentLight: 'bg-indigo-50',
          border: 'border-indigo-200',
          text: 'text-indigo-900',
          subheading: 'text-indigo-950',
          shadowColor: 'shadow-indigo-100'
        };
      case 'executive':
        return {
          headerBg: useGradient 
            ? 'bg-gradient-to-r from-gray-700 to-gray-900' 
            : 'bg-gray-800',
          headerText: 'text-white',
          accent: 'text-gray-600',
          accentBg: 'bg-gray-600',
          accentLight: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          subheading: 'text-gray-900',
          shadowColor: 'shadow-gray-100'
        };
      default:
        return {
          headerBg: useGradient 
            ? 'bg-gradient-to-r from-slate-700 to-slate-900' 
            : 'bg-slate-800',
          headerText: 'text-white',
          accent: 'text-emerald-600',
          accentBg: 'bg-emerald-600',
          accentLight: 'bg-emerald-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          subheading: 'text-slate-900',
          shadowColor: 'shadow-emerald-100'
        };
    }
  };
  
  // Layout style based on selection
  const getLayoutStyle = () => {
    switch (layoutStyle) {
      case 'compact':
        return {
          spacing: 'gap-4',
          sectionSpacing: 'mb-4',
          padding: 'p-4',
          contentPadding: 'p-3'
        };
      case 'spacious':
        return {
          spacing: 'gap-8',
          sectionSpacing: 'mb-8',
          padding: 'p-8',
          contentPadding: 'p-5'
        };
      case 'elegant':
        return {
          spacing: 'gap-6',
          sectionSpacing: 'mb-6',
          padding: 'p-6',
          contentPadding: 'p-4'
        };
      default:
        return {
          spacing: 'gap-6',
          sectionSpacing: 'mb-6',
          padding: 'p-6',
          contentPadding: 'p-4'
        };
    }
  };
  
  // Get border styles based on configuration
  const getBorderStyles = () => {
    const widthClasses = {
      thin: 'border',
      medium: 'border-2',
      thick: 'border-4'
    };
    
    const styleClasses: Record<string, string> = {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
      underline: 'border-none',
      none: 'border-none'  // Adding 'none' property
    };
    
    return `${widthClasses[borderWidth]} ${styleClasses[borderStyle] || 'border-none'}`;
  };
  
  // Get header style class
  const getHeaderStyle = () => {
    switch (headerStyle) {
      case 'minimal':
        return 'py-3';
      case 'standard':
        return 'py-5';
      case 'prominent':
        return 'py-8';
      case 'elegant':
        return 'py-6';
      default:
        return 'py-6';
    }
  };
  
  // Get header alignment class
  const getHeaderAlignmentClass = () => {
    switch (headerAlignment) {
      case 'left':
        return 'text-left';
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-center';
    }
  };
  
  // Get section alignment class
  const getSectionAlignmentClass = (section: keyof typeof sectionAlignment) => {
    const alignment = sectionAlignment[section] || 'left';
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };
  
  // Shadow class if enabled
  const shadowClass = useShadows ? 'shadow-lg' : '';
  
  const colorStyles = getColorStyles();
  const layoutStyles = getLayoutStyle();
  const borderStyles = getBorderStyles();
  const headerStyleClass = getHeaderStyle();
  const headerAlignmentClass = getHeaderAlignmentClass();
  
  // Function to render a section based on its type
  const renderSection = (sectionType: string) => {
    switch (sectionType) {
      case 'summary':
        return summary ? (
          <section className={`${layoutStyles.sectionSpacing} ${colorStyles.border} ${getBorderStyles() !== '' && borderStyle !== 'underline' ? borderStyles : ''} ${borderStyle === 'underline' ? 'border-b-2' : ''} pb-4 ${getSectionAlignmentClass('summary')}`}>
            <h2 className={`text-xl font-semibold mb-3 ${colorStyles.accent} ${borderStyle === 'underline' ? 'border-b pb-1' : ''}`}>
              Professional Summary
            </h2>
            <div className={`prose max-w-none ${colorStyles.text}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary}
              </ReactMarkdown>
            </div>
          </section>
        ) : null;
      case 'experience':
        return experience ? (
          <section className={`${layoutStyles.sectionSpacing} ${colorStyles.border} ${getBorderStyles() !== '' && borderStyle !== 'underline' ? borderStyles : ''} ${borderStyle === 'underline' ? 'border-b-2' : ''} pb-4 ${getSectionAlignmentClass('experience')}`}>
            <h2 className={`text-xl font-semibold mb-3 ${colorStyles.accent} ${borderStyle === 'underline' ? 'border-b pb-1' : ''}`}>
              Professional Experience
            </h2>
            <div className={`prose max-w-none ${colorStyles.text}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {experience}
              </ReactMarkdown>
            </div>
          </section>
        ) : null;
      case 'education':
        return education ? (
          <section className={`${layoutStyles.sectionSpacing} ${colorStyles.border} ${getBorderStyles() !== '' && borderStyle !== 'underline' ? borderStyles : ''} ${borderStyle === 'underline' ? 'border-b-2' : ''} pb-4 ${getSectionAlignmentClass('education')}`}>
            <h2 className={`text-xl font-semibold mb-3 ${colorStyles.accent} ${borderStyle === 'underline' ? 'border-b pb-1' : ''}`}>
              Education
            </h2>
            <div className={`prose max-w-none ${colorStyles.text}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {education}
              </ReactMarkdown>
            </div>
          </section>
        ) : null;
      case 'skills':
        return skills ? (
          <section className={`${layoutStyles.sectionSpacing} ${colorStyles.border} ${getBorderStyles() !== '' && borderStyle !== 'underline' ? borderStyles : ''} ${borderStyle === 'underline' ? 'border-b-2' : ''} pb-4 ${getSectionAlignmentClass('skills')}`}>
            <h2 className={`text-xl font-semibold mb-3 ${colorStyles.accent} ${borderStyle === 'underline' ? 'border-b pb-1' : ''}`}>
              Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.split('\n').map((skill, idx) => (
                <span 
                  key={idx} 
                  className={`inline-block px-3 py-1 rounded-full text-sm ${useGradient ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white' : `${colorStyles.accentBg} text-white`} ${useShadows ? 'shadow-sm' : ''}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        ) : null;
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`w-full bg-white ${font} ${className} ${useShadows ? 'shadow-md' : ''} relative`}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center'
      }}
    >
      {/* Premium watermark for free users */}
      {showWatermark && (
        <PremiumTemplateWatermark templateName="Elegant Premium" />
      )}
      
      {/* Header section with name and contact info */}
      <header className={`${colorStyles.headerBg} ${headerStyleClass} ${layoutStyles.padding} ${colorStyles.headerText} ${headerAlignmentClass}`}>
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-1">{personalInfo?.fullName || 'Your Name'}</h1>
          <div className={`flex flex-wrap justify-center gap-4 mt-2 text-sm opacity-90 ${headerStyle === 'prominent' ? 'mt-4' : 'mt-2'}`}>
            {personalInfo?.email && (
              <div className="flex items-center">
                <span>📧</span>
                <span className="ml-1">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo?.phone && (
              <div className="flex items-center">
                <span>📱</span>
                <span className="ml-1">{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo?.location && (
              <div className="flex items-center">
                <span>📍</span>
                <span className="ml-1">{personalInfo.location}</span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content container */}
      <main className={`${layoutStyles.padding} ${layoutStyles.spacing} flex flex-col ${colorStyles.accentLight}`}>
        {/* Render sections based on sectionOrder prop */}
        {sectionOrder.map(sectionType => renderSection(sectionType))}
      </main>
      
      {/* Footer accent line */}
      <footer className={`${colorStyles.accentBg} h-2`}></footer>
    </div>
  );
} 