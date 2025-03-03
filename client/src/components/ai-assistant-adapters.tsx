import { ResumeContent } from "@shared/schema";
import { AIAssistantCore } from "./ai-assistant-core";

// Log when this file is imported - for debugging
console.log("AI Assistant Adapters loaded");

/**
 * Adapter for the AIAssistantSidebar component
 * This maintains backward compatibility with existing code
 */
export function AIAssistantSidebar({
  resumeContent,
  templateConfig,
  onApplyChanges,
  onClose
}: {
  resumeContent: ResumeContent;
  templateConfig: any;
  onApplyChanges: (section: keyof ResumeContent, content: string) => void;
  onClose: () => void;
}) {
  console.log("AIAssistantSidebar render");
  return (
    <AIAssistantCore
      mode="resume"
      resumeContent={resumeContent}
      templateConfig={templateConfig}
      onApplyChanges={onApplyChanges}
      onClose={onClose}
    />
  );
}

/**
 * Adapter for the AIGeneratorAssistant component
 * This maintains backward compatibility with existing code
 */
interface AIGeneratorAssistantProps {
  currentSection: string;
  currentValue: string;
  onUpdateContent: (content: string) => void;
  onClose: () => void;
  jobTitle?: string;
  industry?: string;
  experienceLevel?: string;
  onFormSubmit?: () => void;
}

export function AIGeneratorAssistant({
  currentSection,
  currentValue,
  onUpdateContent,
  onClose,
  jobTitle,
  industry,
  experienceLevel,
  onFormSubmit
}: AIGeneratorAssistantProps) {
  console.log("AIGeneratorAssistant render");
  return (
    <AIAssistantCore
      mode="generate"
      onClose={onClose}
      currentSection={currentSection}
      currentValue={currentValue}
      onUpdateContent={onUpdateContent}
      jobTitle={jobTitle}
      industry={industry}
      experienceLevel={experienceLevel}
      onFormSubmit={onFormSubmit}
    />
  );
} 