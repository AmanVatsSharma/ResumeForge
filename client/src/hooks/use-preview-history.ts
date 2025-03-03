import { useState, useEffect } from 'react';

const PREVIEW_HISTORY_KEY = 'resumeForge_previewHistory';

interface PreviewHistory {
  [resumeId: string]: string[];
}

/**
 * Custom hook to track which premium templates a user has already previewed
 * This allows each premium template to be previewed once per resume
 */
export function usePreviewHistory(resumeId: string) {
  const [previewedTemplates, setPreviewedTemplates] = useState<string[]>([]);
  
  // Load preview history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(PREVIEW_HISTORY_KEY);
      if (savedHistory) {
        const history: PreviewHistory = JSON.parse(savedHistory);
        setPreviewedTemplates(history[resumeId] || []);
      }
    } catch (error) {
      console.error('Error loading preview history:', error);
    }
  }, [resumeId]);
  
  // Save to localStorage whenever the previewed templates change
  const savePreviewHistory = (updatedTemplates: string[]) => {
    try {
      const savedHistory = localStorage.getItem(PREVIEW_HISTORY_KEY);
      const history: PreviewHistory = savedHistory ? JSON.parse(savedHistory) : {};
      
      history[resumeId] = updatedTemplates;
      localStorage.setItem(PREVIEW_HISTORY_KEY, JSON.stringify(history));
      setPreviewedTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error saving preview history:', error);
    }
  };
  
  // Check if a template has been previewed
  const hasPreviewedTemplate = (templateId: string): boolean => {
    return previewedTemplates.includes(templateId);
  };
  
  // Mark a template as previewed
  const markTemplateAsPreviewed = (templateId: string) => {
    if (!previewedTemplates.includes(templateId)) {
      const updatedTemplates = [...previewedTemplates, templateId];
      savePreviewHistory(updatedTemplates);
    }
  };
  
  // Clear preview history for testing purposes
  const clearPreviewHistory = () => {
    savePreviewHistory([]);
  };
  
  return {
    previewedTemplates,
    hasPreviewedTemplate,
    markTemplateAsPreviewed,
    clearPreviewHistory,
  };
} 