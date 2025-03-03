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
  accentStyle?: 'minimal' | 'bold' | 'geometric' | 'brush';
  useBackgroundPattern?: boolean;
  patternStyle?: 'dots' | 'lines' | 'waves' | 'shapes';
  useIcons?: boolean;
  iconStyle?: 'outline' | 'filled' | 'duotone';
  useTimeline?: boolean;
  headerLayout?: 'centered' | 'split' | 'banner';
  isPremiumUser?: boolean;
  showWatermark?: boolean;
}

export function CreativeTemplate({
  content,
  font = 'font-playfair',
  colorScheme = 'creative',
  layoutStyle = 'asymmetric',
  showBorders = false,
  className = '',
  scale = 1,
  sectionOrder = ['summary', 'experience', 'education', 'skills'],
  sectionAlignment = {
    summary: 'left',
    experience: 'left',
    education: 'left',
    skills: 'left'
  },
  accentStyle = 'geometric',
  useBackgroundPattern = true,
  patternStyle = 'dots',
  useIcons = true,
  iconStyle = 'duotone',
  useTimeline = true,
  headerLayout = 'banner',
  isPremiumUser = false,
  showWatermark = false
}: TemplateProps) {
  // Extract content
  const { personal, summary, experience, education, skills } = content;

  // Color schemes with primary, accent, and text colors
  const colorSchemes = {
    creative: {
      primary: 'bg-indigo-600',
      secondary: 'bg-purple-500',
      accent: 'bg-pink-400',
      text: 'text-indigo-800',
      highlight: 'text-purple-600',
      background: 'bg-gray-50',
      pattern: 'text-indigo-100'
    },
    artistic: {
      primary: 'bg-rose-500',
      secondary: 'bg-amber-400',
      accent: 'bg-cyan-400',
      text: 'text-rose-700',
      highlight: 'text-amber-600',
      background: 'bg-rose-50',
      pattern: 'text-rose-100'
    },
    vibrant: {
      primary: 'bg-emerald-500',
      secondary: 'bg-yellow-400',
      accent: 'bg-blue-400',
      text: 'text-emerald-700',
      highlight: 'text-yellow-600',
      background: 'bg-emerald-50',
      pattern: 'text-emerald-100'
    },
    bold: {
      primary: 'bg-violet-600',
      secondary: 'bg-fuchsia-500',
      accent: 'bg-yellow-400',
      text: 'text-violet-800',
      highlight: 'text-fuchsia-600',
      background: 'bg-gray-50',
      pattern: 'text-violet-100'
    },
    minimal: {
      primary: 'bg-gray-800',
      secondary: 'bg-gray-500',
      accent: 'bg-gray-300',
      text: 'text-gray-800',
      highlight: 'text-gray-600',
      background: 'bg-white',
      pattern: 'text-gray-100'
    },
    warm: {
      primary: 'bg-amber-600',
      secondary: 'bg-red-500',
      accent: 'bg-orange-400',
      text: 'text-amber-800',
      highlight: 'text-orange-600',
      background: 'bg-amber-50',
      pattern: 'text-amber-100'
    }
  };

  // Layout styles
  const layoutStyles = {
    asymmetric: 'grid-cols-[1fr_3fr] divide-x',
    balanced: 'grid-cols-2 divide-x',
    dynamic: 'grid-cols-1',
    staggered: 'grid-cols-1 gap-y-12'
  };

  // Background patterns
  const patterns = {
    dots: `bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-transparent to-transparent via-current via-20% bg-[size:20px_20px]`,
    lines: `bg-[linear-gradient(90deg,_var(--tw-gradient-stops))] from-transparent from-50% to-transparent to-50% via-current via-50% bg-[size:10px_100%]`,
    waves: `bg-[url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264.888-.14 1.652-1.1 2.782.14 3.68.14 1.898 0 2.938-1.275 4.693-1.275 1.753 0 2.486 1.275 4.38 1.275 1.897 0 3.012-1.275 4.693-1.275 1.68 0 2.486 1.275 4.38 1.275 1.898 0 2.938-1.275 4.693-1.275 1.753 0 2.486 1.275 4.38 1.275 1.897 0 2.938-1.275 4.693-1.275 1.68 0 2.938 1.275 4.38 1.275 1.897 0 2.938-1.275 4.693-1.275 1.753 0 2.486 1.275 4.38 1.275V0H0v20h21.184z' fill='%23000' fill-opacity='.1' fill-rule='evenodd'/%3E%3C/svg%3E")]`,
    shapes: `bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]`
  };

  // Accent styles for sections
  const accentStyles = {
    minimal: '',
    bold: 'border-l-8 pl-4',
    geometric: 'relative before:absolute before:top-0 before:left-0 before:w-8 before:h-8 before:-translate-x-2 before:-translate-y-2 before:rotate-45 before:z-0 before:opacity-20',
    brush: 'relative before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-current before:opacity-10 before:scale-105 before:-rotate-1 before:rounded-md'
  };

  // Get color styles based on selected colorScheme
  const getColorStyles = () => {
    const scheme = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.creative;
    
    return {
      primary: scheme.primary,
      secondary: scheme.secondary,
      accent: scheme.accent,
      text: scheme.text,
      highlight: scheme.highlight,
      background: scheme.background,
      pattern: scheme.pattern
    };
  };

  // Get layout style based on selected layoutStyle
  const getLayoutStyle = () => {
    return layoutStyles[layoutStyle as keyof typeof layoutStyles] || layoutStyles.asymmetric;
  };

  // Get icon for section
  const getIcon = (section: string) => {
    let iconSvg;
    
    switch (section) {
      case 'summary':
        iconSvg = (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={iconStyle === 'outline' ? 1.5 : 2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
        break;
      case 'experience':
        iconSvg = (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={iconStyle === 'outline' ? 1.5 : 2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
        break;
      case 'education':
        iconSvg = (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={iconStyle === 'outline' ? 1.5 : 2.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0L3 9m0 0l9 5 9-5m-9 5v6.5M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2zm-3 0H6m3-3h2" />
          </svg>
        );
        break;
      case 'skills':
        iconSvg = (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={iconStyle === 'outline' ? 1.5 : 2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
        break;
      default:
        iconSvg = (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={iconStyle === 'outline' ? 1.5 : 2.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        );
    }
  
  return (
      <div className={`inline-flex items-center justify-center p-2 rounded-full ${getColorStyles().primary} ${getColorStyles().text} bg-opacity-20`}>
        {iconSvg}
            </div>
    );
  };

  // Get pattern style based on selected patternStyle
  const getPatternStyle = () => {
    return patterns[patternStyle as keyof typeof patterns] || patterns.dots;
  };

  // Get accent style for sections
  const getAccentStyle = () => {
    return accentStyles[accentStyle as keyof typeof accentStyles] || accentStyles.minimal;
  };

  // Get header layout class
  const getHeaderClass = () => {
    switch (headerLayout) {
      case 'centered':
        return 'text-center px-8 py-12';
      case 'split':
        return 'grid grid-cols-2 gap-6 p-8';
      case 'banner':
        return `relative p-12 ${getColorStyles().primary} text-white overflow-hidden`;
      default:
        return 'p-8';
    }
  };

  // Get section alignment class
  const getSectionAlignmentClass = (section: keyof typeof sectionAlignment) => {
    const alignment = sectionAlignment[section] || 'left';
    
    switch (alignment) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  // Render a section based on type
  const renderSection = (sectionType: string) => {
    let content;
    let title;
    
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
    
    const colors = getColorStyles();
    
    return (
      <div className={`mb-8 ${getAccentStyle()} ${getSectionAlignmentClass(sectionType as keyof typeof sectionAlignment)}`}>
        <div className="flex items-center gap-3 mb-4">
          {useIcons && getIcon(sectionType)}
          <h2 className={`text-2xl font-semibold ${colors.text}`}>{title}</h2>
          </div>
          
        {useTimeline && sectionType === 'experience' && (
          <div className="relative pl-6 border-l-2 border-dashed border-current border-opacity-30 space-y-6">
            <div className="whitespace-pre-wrap">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
        
        {!(useTimeline && sectionType === 'experience') && (
          <div className="whitespace-pre-wrap">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
              </ReactMarkdown>
            </div>
        )}
      </div>
    );
  };

  // Set up the color styles
  const colors = getColorStyles();

  // Render the template
  return (
    <div 
      className={`relative ${font} ${colors.background} min-h-[29.7cm] w-full rounded overflow-hidden shadow-lg ${className}`} 
      style={{ 
        fontSize: `${scale * 100}%`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {/* Background Pattern */}
      {useBackgroundPattern && (
        <div className={`absolute inset-0 ${getPatternStyle()} opacity-10 ${colors.pattern} pointer-events-none`}></div>
      )}
      
      {/* Header */}
      <header className={getHeaderClass()}>
        {headerLayout === 'banner' && (
          <div className="absolute inset-0 opacity-10">
            {patternStyle === 'dots' && (
              <div className={`absolute inset-0 ${patterns.dots} ${colors.pattern}`}></div>
            )}
            {patternStyle !== 'dots' && (
              <div className="absolute inset-0 bg-black bg-opacity-5"></div>
            )}
          </div>
        )}
        
        {headerLayout === 'split' ? (
          <>
            <div>
              <h1 className={`text-4xl font-bold mb-1 ${colors.text}`}>{personal?.name || 'Your Name'}</h1>
              <p className={`text-xl ${colors.highlight}`}>{personal?.title || 'Professional Title'}</p>
            </div>
            <div className="text-right">
              <p className="mb-1">{personal?.email || 'email@example.com'}</p>
              <p className="mb-1">{personal?.phone || '(123) 456-7890'}</p>
              <p>{personal?.location || 'City, State'}</p>
            </div>
          </>
        ) : (
          <>
            <h1 className={`text-4xl font-bold mb-2 ${headerLayout === 'banner' ? 'text-white' : colors.text}`}>
              {personal?.name || 'Your Name'}
            </h1>
            <p className={`text-xl mb-4 ${headerLayout === 'banner' ? 'text-white text-opacity-90' : colors.highlight}`}>
              {personal?.title || 'Professional Title'}
            </p>
            <div className={`flex flex-wrap justify-${headerLayout === 'centered' ? 'center' : 'start'} gap-4 text-sm ${headerLayout === 'banner' ? 'text-white text-opacity-80' : ''}`}>
              {personal?.email && (
                <p>{personal.email}</p>
              )}
              {personal?.phone && (
                <p>{personal.phone}</p>
              )}
              {personal?.location && (
                <p>{personal.location}</p>
              )}
        </div>
          </>
        )}
      </header>
      
      {/* Content */}
      <main className={`p-8 ${layoutStyle === 'staggered' ? '' : 'grid'} ${getLayoutStyle()}`}>
        {/* Render sections based on sectionOrder */}
        {sectionOrder.map((section) => (
          <div key={section} className={layoutStyle === 'staggered' ? 'mb-12' : ''}>
            {renderSection(section)}
      </div>
        ))}
      </main>
      
      {/* Watermark for non-premium users */}
      {!isPremiumUser && showWatermark && (
        <PremiumTemplateWatermark />
      )}
    </div>
  );
} 