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
  useAccentSidebar?: boolean;
  sidebarWidth?: 'narrow' | 'medium' | 'wide';
  useIcons?: boolean;
  primarySections?: string[];
  secondarySections?: string[];
  useDividers?: boolean;
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
  sidebarPosition?: 'left' | 'right';
  isPremiumUser?: boolean;
  showWatermark?: boolean;
}

export function ProfessionalTemplate({
  content,
  font = 'font-montserrat',
  colorScheme = 'professional',
  layoutStyle = 'professional',
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
  useAccentSidebar = true,
  sidebarWidth = 'medium',
  useIcons = true,
  primarySections = ['summary', 'experience'],
  secondarySections = ['education', 'skills'],
  useDividers = true,
  dividerStyle = 'solid',
  sidebarPosition = 'right',
  isPremiumUser = false,
  showWatermark = false
}: TemplateProps) {
  const { personalInfo, summary, experience, education, skills } = content;
  
  // Define the color palette based on the color scheme
  const getColorStyles = () => {
    switch (colorScheme) {
      case 'professional':
        return {
          primary: 'bg-gray-800',
          secondary: 'bg-gray-100',
          accent: 'text-gray-700',
          accentBg: 'bg-gray-200',
          border: 'border-gray-300',
          text: 'text-gray-700',
          subheading: 'text-gray-900',
          headerText: 'text-white',
        };
      case 'corporate':
        return {
          primary: 'bg-blue-800',
          secondary: 'bg-blue-50',
          accent: 'text-blue-700',
          accentBg: 'bg-blue-100',
          border: 'border-blue-200',
          text: 'text-gray-700',
          subheading: 'text-blue-900',
          headerText: 'text-white',
        };
      case 'modern-dark':
        return {
          primary: 'bg-slate-900',
          secondary: 'bg-slate-50',
          accent: 'text-slate-700',
          accentBg: 'bg-slate-100',
          border: 'border-slate-200',
          text: 'text-slate-700',
          subheading: 'text-slate-900',
          headerText: 'text-white',
        };
      case 'tech':
        return {
          primary: 'bg-cyan-800',
          secondary: 'bg-gray-50',
          accent: 'text-cyan-700',
          accentBg: 'bg-cyan-100',
          border: 'border-cyan-200',
          text: 'text-gray-700',
          subheading: 'text-cyan-900',
          headerText: 'text-white',
        };
      case 'minimal':
        return {
          primary: 'bg-gray-900',
          secondary: 'bg-gray-50',
          accent: 'text-gray-600',
          accentBg: 'bg-gray-100',
          border: 'border-gray-200',
          text: 'text-gray-700',
          subheading: 'text-gray-800',
          headerText: 'text-white',
        };
      case 'creative':
        return {
          primary: 'bg-purple-700',
          secondary: 'bg-purple-50',
          accent: 'text-purple-600',
          accentBg: 'bg-purple-100',
          border: 'border-purple-200',
          text: 'text-gray-700',
          subheading: 'text-purple-800',
          headerText: 'text-white',
        };
      case 'bold':
        return {
          primary: 'bg-red-700',
          secondary: 'bg-red-50',
          accent: 'text-red-600',
          accentBg: 'bg-red-100',
          border: 'border-red-200',
          text: 'text-gray-700',
          subheading: 'text-red-800',
          headerText: 'text-white',
        };
      case 'elegant':
        return {
          primary: 'bg-emerald-700',
          secondary: 'bg-emerald-50',
          accent: 'text-emerald-600',
          accentBg: 'bg-emerald-100',
          border: 'border-emerald-200',
          text: 'text-gray-700',
          subheading: 'text-emerald-800',
          headerText: 'text-white',
        };
      case 'warm':
        return {
          primary: 'bg-orange-600',
          secondary: 'bg-orange-50',
          accent: 'text-orange-500',
          accentBg: 'bg-orange-100',
          border: 'border-orange-200',
          text: 'text-gray-700',
          subheading: 'text-orange-800',
          headerText: 'text-white',
        };
      default:
        return {
          primary: 'bg-blue-700',
          secondary: 'bg-blue-50',
          accent: 'text-blue-600',
          accentBg: 'bg-blue-100',
          border: 'border-blue-200',
          text: 'text-gray-700',
          subheading: 'text-blue-900',
          headerText: 'text-white',
        };
    }
  };
  
  const getLayoutStyle = () => {
    switch (layoutStyle) {
      case 'classic':
        return 'space-y-5';
      case 'modern':
        return 'space-y-6';
      case 'compact':
        return 'space-y-3';
      case 'professional':
        return 'space-y-5';
      case 'executive':
        return 'space-y-6';
      default:
        return 'space-y-5';
    }
  };
  
  const getSidebarWidthClass = () => {
    switch (sidebarWidth) {
      case 'narrow':
        return 'w-1/4';
      case 'medium':
        return 'w-1/3';
      case 'wide':
        return 'w-2/5';
      default:
        return 'w-1/3';
    }
  };
  
  const getDividerClass = () => {
    switch (dividerStyle) {
      case 'solid':
        return 'border-solid';
      case 'dashed':
        return 'border-dashed';
      case 'dotted':
        return 'border-dotted';
      default:
        return 'border-solid';
    }
  };
  
  const getIcon = (section: string) => {
    if (!useIcons) return null;
    
    switch (section) {
      case 'summary':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
          </svg>
        );
      case 'experience':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path>
          </svg>
        );
      case 'education':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
          </svg>
        );
      case 'skills':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
          </svg>
        );
      default:
        return null;
    }
  };
  
  const renderSection = (sectionType: string) => {
    let content = '';
    let title = '';
    
    switch (sectionType) {
      case 'summary':
        content = summary;
        title = 'Professional Summary';
        break;
      case 'experience':
        content = experience;
        title = 'Work Experience';
        break;
      case 'education':
        content = education;
        title = 'Education';
        break;
      case 'skills':
        content = skills;
        title = 'Skills';
        break;
      default:
        return null;
    }
    
    if (!content) return null;
    
    return (
      <div className="mb-5">
        <div className={`flex items-center ${getSectionAlignmentClass(sectionType as keyof typeof sectionAlignment)}`}>
          {getIcon(sectionType)}
          <h2 className={`text-lg font-bold mb-2 ${colorStyles.subheading}`}>
            {title}
          </h2>
        </div>
        
        {useDividers && showBorders && (
          <div className={`w-full h-px ${colorStyles.border} mb-3 ${getDividerClass()}`}></div>
        )}
        
        <div className="whitespace-pre-wrap prose max-w-none prose-sm prose-headings:mb-2 prose-p:mb-1.5">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };
  
  const getSectionAlignmentClass = (section: keyof typeof sectionAlignment) => {
    const alignment = sectionAlignment[section] || 'left';
    
    switch (alignment) {
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-start';
    }
  };
  
  const colorStyles = getColorStyles();
  const layoutSpacing = getLayoutStyle();
  const sidebarWidthClass = getSidebarWidthClass();
  
  // Split sections into main and sidebar content
  const mainContent = primarySections || sectionOrder.filter(s => !secondarySections?.includes(s));
  const sidebarContent = secondarySections || sectionOrder.filter(s => !primarySections?.includes(s));
  
  return (
    <div 
      className={`relative w-full min-h-[29.7cm] bg-white ${font} text-base text-gray-800 ${className} overflow-hidden print:shadow-none`} 
      style={{transform: `scale(${scale})`, transformOrigin: 'top center'}}
    >
      {showWatermark && (
        <PremiumTemplateWatermark templateName="Professional Template" />
      )}
      
      {/* Header Section with Name and Contact */}
      <div className={`${colorStyles.primary} text-white p-6`}>
        <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-center sm:text-left">
              {personalInfo?.fullName || 'Your Name'}
            </h1>
          </div>
          
          <div className="flex flex-col sm:items-end mt-3 sm:mt-0 text-center sm:text-right">
            {personalInfo?.email && (
              <p className="text-sm">{personalInfo.email}</p>
            )}
            {personalInfo?.phone && (
              <p className="text-sm">{personalInfo.phone}</p>
            )}
            {personalInfo?.location && (
              <p className="text-sm">{personalInfo.location}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`p-6 ${layoutSpacing}`}>
        <div className={`flex flex-col ${sidebarPosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'} lg:gap-6`}>
          {/* Main Column */}
          <div className={`flex-1 ${sidebarPosition === 'left' ? '' : 'lg:pr-6'}`}>
            {mainContent.map(section => renderSection(section))}
          </div>
          
          {/* Sidebar */}
          <div className={`lg:${sidebarWidthClass} ${useAccentSidebar ? `${colorStyles.secondary} p-4 rounded-lg` : ''} ${sidebarPosition === 'left' ? 'lg:pr-6' : ''}`}>
            {sidebarContent.map(section => renderSection(section))}
          </div>
        </div>
      </div>
    </div>
  );
} 