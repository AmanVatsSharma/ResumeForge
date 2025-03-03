import { useState, useEffect } from 'react';
import { getDefaultTemplateConfig, getTemplateClasses, applySpacingPreset, type ExtendedTemplateConfig } from '@/lib/template-utils';
import { useAuth } from './use-auth';
import { apiRequest } from '@/lib/queryClient';

// Use the ExtendedTemplateConfig interface from template-utils
export type TemplateConfig = ExtendedTemplateConfig;

export function useCustomization(templateId: string, resumeId?: string) {
  const { user } = useAuth();
  const [config, setConfig] = useState<TemplateConfig>(() => 
    getDefaultTemplateConfig(templateId)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<TemplateConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load saved configuration when template ID changes
  useEffect(() => {
    // Reset to default when template changes
    const defaultConfig = getDefaultTemplateConfig(templateId);
    setConfig(defaultConfig);
    
    // Reset history
    setHistory([defaultConfig]);
    setHistoryIndex(0);
    
    // If we have a resume ID, try to load saved config
    if (resumeId && user) {
      loadSavedConfig();
    }
  }, [templateId, resumeId, user]);

  // Load saved configuration for this resume
  const loadSavedConfig = async () => {
    try {
      if (!resumeId) return;
      
      const response = await apiRequest('GET', `/api/resumes/${resumeId}/config`);
      if (response.ok) {
        const savedConfig = await response.json();
        if (savedConfig) {
          const mergedConfig = {
            ...getDefaultTemplateConfig(templateId),
            ...savedConfig
          };
          setConfig(mergedConfig);
          setHistory([mergedConfig]);
          setHistoryIndex(0);
        }
      }
    } catch (error) {
      console.error('Failed to load template configuration:', error);
    }
  };

  // Save configuration for this resume
  const saveConfig = async () => {
    try {
      if (!resumeId) return false;
      
      setIsSaving(true);
      
      const response = await apiRequest('PUT', `/api/resumes/${resumeId}/config`, config);
      
      if (!response.ok) {
        throw new Error('Failed to save template configuration');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving template configuration:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update a single configuration property
  const updateConfig = (key: keyof TemplateConfig, value: any) => {
    // Handle special cases
    if (key === 'spacingPreset') {
      const newConfig = applySpacingPreset({...config}, value);
      setConfig(newConfig);
      
      // Add to history
      const newHistory = [...history.slice(0, historyIndex + 1), newConfig];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return;
    }

    // Regular property update
    const newConfig = {
      ...config,
      [key]: value
    };
    
    setConfig(newConfig);
    
    // Add to history
    const newHistory = [...history.slice(0, historyIndex + 1), newConfig];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Bulk update multiple configuration properties
  const bulkUpdateConfig = (updates: Partial<TemplateConfig>) => {
    const newConfig = {
      ...config,
      ...updates
    };
    
    setConfig(newConfig);
    
    // Add to history
    const newHistory = [...history.slice(0, historyIndex + 1), newConfig];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo changes
  const undoChanges = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setConfig(history[historyIndex - 1]);
    }
  };

  // Redo changes
  const redoChanges = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setConfig(history[historyIndex + 1]);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaultConfig = getDefaultTemplateConfig(templateId);
    setConfig(defaultConfig);
    
    // Add to history
    const newHistory = [...history.slice(0, historyIndex + 1), defaultConfig];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Generate class names based on the current configuration
  const classes = getTemplateClasses(config);

  // Track history for undo/redo operations
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    config,
    classes,
    updateConfig,
    bulkUpdateConfig,
    saveConfig,
    isSaving,
    resetToDefaults,
    undoChanges,
    redoChanges,
    canUndo,
    canRedo
  };
} 