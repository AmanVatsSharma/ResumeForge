import { ResumeContent } from "@shared/schema";
import { sendChatMessage, ChatMessage, ChatResponse } from "@/lib/ai-service";
import { TemplateConfig } from "@/hooks/use-customization";

/**
 * AI Model type - Gemini for free users, OpenAI for premium
 */
export type AIModel = "gemini" | "openai";

/**
 * Actions that the AI assistant can perform
 */
export type AssistantAction = 
  | { type: "changeTemplate"; templateId: string }
  | { type: "updateContent"; section: keyof ResumeContent; content: string }
  | { type: "updateStyle"; config: Partial<TemplateConfig> }
  | { type: "none" };

/**
 * Response from the AI assistant
 */
export interface AssistantResponse {
  message: string;
  action: AssistantAction;
}

/**
 * Service for AI assistant interactions
 */
class AIAssistantService {
  private _model: AIModel = "gemini";
  
  /**
   * Set the AI model to use
   * @param model The AI model (gemini or openai)
   */
  setModel(model: AIModel) {
    this._model = model;
  }
  
  /**
   * Get the current AI model
   */
  getModel(): AIModel {
    return this._model;
  }
  
  /**
   * Send a message to the AI assistant
   * 
   * @param message The user's message
   * @param resumeState The current resume state (content and template)
   * @param templateConfig The current template configuration
   * @param chatHistory The history of previous chat messages
   * @returns Promise with the assistant's response
   */
  async sendMessage(
    message: string,
    resumeState: { content: ResumeContent; templateId: string },
    templateConfig: TemplateConfig,
    chatHistory: ChatMessage[]
  ): Promise<AssistantResponse> {
    try {
      // Add context about template configuration to help AI understand the current state
      const contextEnhancedMessage = `
User Message: ${message}

Current Template: ${resumeState.templateId}
Current Style Settings: ${JSON.stringify(templateConfig)}
      `.trim();
      
      // Call the AI service with the enhanced context
      const response = await sendChatMessage(
        contextEnhancedMessage,
        resumeState,
        chatHistory,
        this._model,
        templateConfig
      );
      
      // Parse the response to extract any actions
      const action = this.parseActionFromResponse(response);
      
      return {
        message: response.response,
        action
      };
    } catch (error) {
      console.error("Error sending message to AI assistant:", error);
      
      // Check for specific error types to provide better feedback
      let errorMessage = "I'm having trouble connecting to the AI service right now. Please try again in a moment.";
      
      if (error instanceof Error) {
        // Handle specific error messages
        if (error.message.includes("500")) {
          errorMessage = "The AI service is currently experiencing high demand or maintenance. Please try again shortly.";
        } else if (error.message.includes("403")) {
          errorMessage = "You don't have permission to use this AI model. If you're trying to use OpenAI, please upgrade to premium.";
        } else if (error.message.includes("429")) {
          errorMessage = "You've reached the usage limit for AI requests. Please try again later.";
        } else if (error.message.includes("API_KEY_INVALID") || error.message.includes("API key not valid")) {
          errorMessage = "There appears to be an issue with the AI configuration. The API key might be invalid or not activated for the Gemini model being used. Please contact support.";
        } else if (error.message.includes("PERMISSION_DENIED")) {
          errorMessage = "The AI service doesn't have permission to access the requested model. Please contact support.";
        }
      }
      
      // Return a fallback response with no action
      return {
        message: errorMessage,
        action: { type: "none" }
      };
    }
  }
  
  /**
   * Parse the AI response to extract any actions
   * 
   * @param response The response from the AI
   * @returns The extracted action, or a "none" action if no action found
   */
  private parseActionFromResponse(response: ChatResponse): AssistantAction {
    try {
      // Check for template updates
      if (response.updates?.templateId) {
        return {
          type: "changeTemplate",
          templateId: response.updates.templateId
        };
      }
      
      // Check for content updates
      if (response.updates?.content) {
        // For simplicity, assume the first changed section is what we want to update
        const changedSection = Object.entries(response.updates.content).find(
          ([_, value]) => value !== undefined
        );
        
        if (changedSection) {
          const [section, content] = changedSection;
          return {
            type: "updateContent",
            section: section as keyof ResumeContent,
            content: content as string
          };
        }
      }
      
      // Check for style updates
      if (response.updates?.style) {
        return {
          type: "updateStyle",
          config: response.updates.style as Partial<TemplateConfig>
        };
      }
      
      // Default to no action
      return { type: "none" };
    } catch (error) {
      console.error("Error parsing action from AI response:", error);
      return { type: "none" };
    }
  }
}

// Export a singleton instance
export const aiAssistantService = new AIAssistantService(); 