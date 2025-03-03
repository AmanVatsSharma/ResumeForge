import React from 'react';
import { Lock } from 'lucide-react';

interface WatermarkProps {
  templateName: string;
  position?: 'top-right' | 'bottom-right' | 'center';
  opacity?: number;
}

export function PremiumTemplateWatermark({ 
  templateName,
  position = 'bottom-right',
  opacity = 0.5
}: WatermarkProps) {
  // Get app name from env or use default
  const appName = 'ResumeForge';
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };
  
  // Diagonal watermark that repeats across the entire document
  return (
    <>
      {/* Corner badge */}
      <div className={`absolute ${positionClasses[position]} z-20 px-3 py-2 bg-yellow-500 text-white rounded-md shadow-md flex items-center gap-2 text-sm font-medium`}>
        <Lock className="h-4 w-4" />
        Premium Template
      </div>
      
      {/* Diagonal repeating watermark */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: 'rotate(-45deg)',
            opacity: opacity,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(252, 211, 77, 0.1) 100px, rgba(252, 211, 77, 0.1) 200px)`,
            backgroundSize: '200px 200px'
          }}
        >
          <div className="select-none flex flex-wrap justify-center gap-16" style={{ opacity: 0.15 }}>
            {Array(20).fill(0).map((_, i) => (
              <div key={i} className="flex items-center mx-4 text-lg font-bold text-yellow-600">
                {appName}
                <Lock className="h-4 w-4 ml-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 