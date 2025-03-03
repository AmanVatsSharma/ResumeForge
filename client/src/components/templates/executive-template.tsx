import React from 'react';
import { type ResumeContent } from '@shared/schema';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MdEmail, MdPhone, MdLocationOn, MdPerson, MdWork, MdSchool, MdAutoAwesome } from "react-icons/md";

interface TemplateProps {
  content: ResumeContent;
  font?: string;
  colorScheme?: 'executive' | 'professional' | 'corporate' | 'modern' | 'minimal' | 'bold';
  layoutStyle?: 'executive' | 'twoColumn' | 'balanced' | 'compact';
  showBorders?: boolean;
  className?: string;
  scale?: number;
  sectionOrder?: string[];
  sectionAlignment?: 'left' | 'justified' | 'balanced';
  headerStyle?: 'centered' | 'leftAligned' | 'minimal' | 'boxed';
  useIcons?: boolean;
  useDividers?: boolean;
  dividerStyle?: 'solid' | 'dashed' | 'dotted' | 'thick' | 'double';
  borderWidth?: 'thin' | 'medium' | 'thick';
  useMonogram?: boolean;
  monogramStyle?: 'circle' | 'square' | 'rounded' | 'diamond';
  isPremiumUser?: boolean;
  showWatermark?: boolean;
}

interface WatermarkProps {
  templateName: string;
}

function PremiumTemplateWatermark({ templateName }: WatermarkProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-50 z-50">
      ResumeForge Premium - {templateName} Template
    </div>
  );
}

export function ExecutiveTemplate({
  content,
  font = 'font-serif',
  colorScheme = 'executive',
  layoutStyle = 'executive',
  showBorders = true,
  className = '',
  scale = 1,
  sectionOrder = ['summary', 'experience', 'education', 'skills'],
  sectionAlignment = 'left',
  headerStyle = 'centered',
  useIcons = true,
  useDividers = true,
  dividerStyle = 'solid',
  borderWidth = 'medium',
  useMonogram = false,
  monogramStyle = 'circle',
  isPremiumUser = false,
  showWatermark = true,
}: TemplateProps) {
  const { personalInfo, summary, experience, education, skills } = content;
  
  // Get initials for monogram
  const getInitials = () => {
    const fullName = personalInfo.fullName || '';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    } else if (names.length === 1 && names[0].length > 0) {
      return names[0][0].toUpperCase();
    }
    return 'AB';
  };

  const getColorStyles = () => {
    switch (colorScheme) {
      case 'executive':
        return {
          primary: 'text-gray-900',
          secondary: 'text-gray-700',
          accent: 'text-blue-800',
          divider: 'border-gray-300',
          background: 'bg-white',
          heading: 'text-blue-900',
          monogram: 'bg-blue-900 text-white',
        };
      case 'professional':
        return {
          primary: 'text-gray-900',
          secondary: 'text-gray-700',
          accent: 'text-indigo-700',
          divider: 'border-gray-300',
          background: 'bg-white',
          heading: 'text-indigo-800',
          monogram: 'bg-indigo-700 text-white',
        };
      case 'corporate':
        return {
          primary: 'text-gray-900',
          secondary: 'text-gray-700',
          accent: 'text-gray-800',
          divider: 'border-gray-400',
          background: 'bg-white',
          heading: 'text-gray-800',
          monogram: 'bg-gray-800 text-white',
        };
      case 'modern':
        return {
          primary: 'text-gray-900',
          secondary: 'text-gray-600',
          accent: 'text-teal-700',
          divider: 'border-gray-300',
          background: 'bg-white',
          heading: 'text-teal-800',
          monogram: 'bg-teal-700 text-white',
        };
      case 'minimal':
        return {
          primary: 'text-gray-900',
          secondary: 'text-gray-500',
          accent: 'text-gray-700',
          divider: 'border-gray-200',
          background: 'bg-white',
          heading: 'text-gray-700',
          monogram: 'bg-gray-700 text-white',
        };
      case 'bold':
        return {
          primary: 'text-gray-900',
          secondary: 'text-gray-700',
          accent: 'text-red-700',
          divider: 'border-gray-300',
          background: 'bg-white',
          heading: 'text-red-800',
          monogram: 'bg-red-700 text-white',
        };
      default:
        return {
          primary: 'text-gray-900',
          secondary: 'text-gray-700',
          accent: 'text-blue-800',
          divider: 'border-gray-300',
          background: 'bg-white',
          heading: 'text-blue-900',
          monogram: 'bg-blue-900 text-white',
        };
    }
  };

  const getLayoutStyle = () => {
    switch (layoutStyle) {
      case 'executive':
        return 'max-w-5xl mx-auto p-8 md:p-10';
      case 'twoColumn':
        return 'max-w-5xl mx-auto p-8 md:p-10 md:grid md:grid-cols-3 md:gap-8';
      case 'balanced':
        return 'max-w-5xl mx-auto p-8 md:p-10';
      case 'compact':
        return 'max-w-4xl mx-auto p-6 md:p-8';
      default:
        return 'max-w-5xl mx-auto p-8 md:p-10';
    }
  };

  const getHeaderStyle = () => {
    switch (headerStyle) {
      case 'centered':
        return 'text-center mb-8';
      case 'leftAligned':
        return 'text-left mb-8';
      case 'minimal':
        return 'text-left mb-6 pb-4 border-b';
      case 'boxed':
        return 'text-center mb-8 p-6 border rounded-lg';
      default:
        return 'text-center mb-8';
    }
  };

  const getDividerStyle = () => {
    const colors = getColorStyles();
    const borderWidthClass = borderWidth === 'thin' ? 'border-t' : borderWidth === 'medium' ? 'border-t-2' : 'border-t-4';
    
    switch (dividerStyle) {
      case 'solid':
        return `${borderWidthClass} ${colors.divider} my-6`;
      case 'dashed':
        return `${borderWidthClass} border-dashed ${colors.divider} my-6`;
      case 'dotted':
        return `${borderWidthClass} border-dotted ${colors.divider} my-6`;
      case 'thick':
        return `border-t-4 ${colors.divider} my-6`;
      case 'double':
        return `border-t-2 border-double ${colors.divider} my-6`;
      default:
        return `${borderWidthClass} ${colors.divider} my-6`;
    }
  };

  const getMonogramStyle = () => {
    const colors = getColorStyles();
    
    switch (monogramStyle) {
      case 'circle':
        return `${colors.monogram} h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold`;
      case 'square':
        return `${colors.monogram} h-14 w-14 flex items-center justify-center text-xl font-bold`;
      case 'rounded':
        return `${colors.monogram} h-14 w-14 rounded-lg flex items-center justify-center text-xl font-bold`;
      case 'diamond':
        return `${colors.monogram} h-14 w-14 transform rotate-45 flex items-center justify-center text-xl font-bold`;
      default:
        return `${colors.monogram} h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold`;
    }
  };

  const colors = getColorStyles();
  
  const headerClasses = `${getHeaderStyle()} ${colors.primary}`;
  const sectionHeaderClasses = `text-lg font-bold mb-3 ${colors.heading}`;
  const sectionClasses = `mb-6 ${colors.primary}`;
  
  const contentClasses = sectionAlignment === 'justified' 
    ? 'text-justify' 
    : sectionAlignment === 'balanced' 
      ? 'max-w-prose mx-auto' 
      : '';

  const renderSection = (section: string) => {
    const iconSize = 20;
    let icon = null;
    let title = '';
    let content = '';
    
    switch (section) {
      case 'summary':
        icon = <MdPerson size={iconSize} />;
        title = 'Professional Summary';
        content = summary;
        break;
      case 'experience':
        icon = <MdWork size={iconSize} />;
        title = 'Work Experience';
        content = experience;
        break;
      case 'education':
        icon = <MdSchool size={iconSize} />;
        title = 'Education';
        content = education;
        break;
      case 'skills':
        icon = <MdAutoAwesome size={iconSize} />;
        title = 'Skills';
        content = skills;
        break;
      default:
        return null;
    }
    
    return (
      <div key={section} className={sectionClasses}>
        <div className="flex items-center mb-3">
          {useIcons && (
            <span className={`mr-2 ${colors.accent}`}>{icon}</span>
          )}
          <h2 className={sectionHeaderClasses}>{title}</h2>
        </div>
        <div className={`whitespace-pre-wrap prose max-w-none prose-headings:mb-2 prose-p:mb-1 ${colors.secondary} ${contentClasses}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };
  
  return (
    <div 
      className={`${font} ${colors.background} ${getLayoutStyle()} ${className}`}
      style={{ 
        transform: `scale(${scale})`, 
        transformOrigin: 'top center',
        border: showBorders ? '1px solid #e2e8f0' : 'none',
        boxShadow: showBorders ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none',
      }}
    >
      {/* Header Section */}
      <header className={headerClasses}>
        <div className="flex flex-col items-center md:flex-row md:justify-center gap-6">
          {useMonogram && (
            <div className={getMonogramStyle()}>
              {monogramStyle === 'diamond' ? (
                <div className="transform -rotate-45">{getInitials()}</div>
              ) : (
                getInitials()
              )}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{personalInfo?.fullName || 'Full Name'}</h1>
            {/* We don't have title/position in ResumeContent, so either don't show it or add a placeholder */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
              <div className="flex items-center">
                <MdEmail className="mr-1" />
                <span>{personalInfo?.email || 'email@example.com'}</span>
              </div>
              <div className="flex items-center">
                <MdPhone className="mr-1" />
                <span>{personalInfo?.phone || '(123) 456-7890'}</span>
              </div>
              <div className="flex items-center">
                <MdLocationOn className="mr-1" />
                <span>{personalInfo?.location || 'City, State'}</span>
              </div>
          </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {sectionOrder.map(section => renderSection(section))}
      </main>

      {/* Footer/Divider */}
      {useDividers && (
        <div className={getDividerStyle()}></div>
      )}
      
      {/* Premium Watermark */}
      {showWatermark && !isPremiumUser && (
        <PremiumTemplateWatermark templateName="Executive" />
      )}
    </div>
  );
} 