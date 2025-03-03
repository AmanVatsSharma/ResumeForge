import { z } from "zod";
import { apiRequest } from "./queryClient";

const generateContentSchema = z.object({
  content: z.string(),
});

type GenerateContentResponse = z.infer<typeof generateContentSchema>;

/**
 * Options for generating content with AI
 * @interface GenerateContentOptions
 * @property {string} [jobTitle] - Optional job title for targeted content
 * @property {string} [industry] - Optional industry for targeted content
 * @property {string} [experienceLevel] - Optional experience level (entry, mid, senior)
 * @property {string} [tone] - Optional tone for content (professional, creative, academic, technical, executive)
 * @property {string} [jobDescription] - Optional job description for tailoring content
 * @property {boolean} [optimizeForATS] - Whether to optimize content for Applicant Tracking Systems
 */
export interface GenerateContentOptions {
  jobTitle?: string;
  industry?: string;
  experienceLevel?: string;
  tone?: string;
  jobDescription?: string;
  optimizeForATS?: boolean;
}

/**
 * Message structure for the AI chat interface
 * @interface ChatMessage
 * @property {"user" | "assistant"} role - The role of the message sender
 * @property {string} content - The content of the message
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Response structure for AI chat
 * @interface ChatResponse
 * @property {string} response - The AI assistant's response message
 * @property {any} [updates] - Optional updates to the resume content
 */
export interface ChatResponse {
  response: string;
  updates?: {
    content?: any;
    templateId?: string;
    style?: any;
  };
}

/**
 * ATS Scan result interface
 * @interface ATSScanResult
 * @property {number} score - Overall ATS compatibility score (0-100)
 * @property {string[]} missingKeywords - Keywords from job description missing in resume
 * @property {string[]} suggestions - Suggestions for improving ATS compatibility
 * @property {Record<string, number>} sectionScores - Section-by-section scores
 */
export interface ATSScanResult {
  score: number; 
  missingKeywords: string[];
  suggestions: string[];
  sectionScores: Record<string, number>;
}

/**
 * Keyword analysis result interface
 * @interface KeywordAnalysisResult
 * @property {string[]} topKeywords - Top keywords found in the resume
 * @property {string[]} suggestedKeywords - Suggested keywords based on job description or industry
 * @property {string[]} missingKeywords - Keywords that should be added
 * @property {string[]} overusedKeywords - Keywords that are used too frequently
 */
export interface KeywordAnalysisResult {
  topKeywords: string[];
  suggestedKeywords: string[];
  missingKeywords: string[];
  overusedKeywords: string[];
}

/**
 * Generates or enhances content for a specific resume section using AI
 * 
 * @param {string} section - The resume section to generate content for (e.g., "summary", "experience")
 * @param {string} currentContent - The current content of the section, if any
 * @param {GenerateContentOptions} [options] - Optional parameters for customizing content generation
 * @returns {Promise<string>} A promise that resolves to the generated content
 * @throws {Error} If content generation fails
 */
export async function generateContent(
  section: string, 
  currentContent: string, 
  options?: GenerateContentOptions
): Promise<string> {
  try {
    const res = await apiRequest('POST', '/api/ai/generate', {
      section,
      currentContent,
      ...(options || {}), // Include optional parameters if provided
    });

    const data = generateContentSchema.parse(await res.json());
    return data.content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

/**
 * Tailors resume content based on a job description
 * 
 * @param {Object} resumeContent - The current resume content
 * @param {string} jobDescription - The job description to tailor for
 * @param {boolean} [optimizeForATS=true] - Whether to optimize for ATS
 * @returns {Promise<Object>} A promise that resolves to the tailored resume content
 * @throws {Error} If content tailoring fails
 */
export async function tailorResumeToJobDescription(
  resumeContent: any,
  jobDescription: string,
  optimizeForATS: boolean = true
): Promise<any> {
  try {
    const res = await apiRequest('POST', '/api/ai/tailor', {
      resumeContent,
      jobDescription,
      optimizeForATS,
    });

    return await res.json();
  } catch (error) {
    console.error('Error tailoring resume:', error);
    throw error;
  }
}

/**
 * Analyzes resume content against ATS (Applicant Tracking System) standards
 * 
 * @param {Object} resumeContent - The resume content to analyze
 * @param {string} [jobDescription] - Optional job description for context
 * @returns {Promise<ATSScanResult>} A promise that resolves to the ATS scan results
 * @throws {Error} If ATS analysis fails
 */
export async function scanResumeForATS(
  resumeContent: any,
  jobDescription?: string
): Promise<ATSScanResult> {
  try {
    const res = await apiRequest('POST', '/api/ai/ats-scan', {
      resumeContent,
      jobDescription,
    });

    return await res.json();
  } catch (error) {
    console.error('Error scanning resume for ATS:', error);
    throw error;
  }
}

/**
 * Analyzes keywords in a resume and suggests improvements
 * 
 * @param {Object} resumeContent - The resume content to analyze
 * @param {string} [jobDescription] - Optional job description for targeted analysis
 * @param {string} [industry] - Optional industry for context
 * @returns {Promise<KeywordAnalysisResult>} A promise that resolves to the keyword analysis results
 * @throws {Error} If keyword analysis fails
 */
export async function analyzeResumeKeywords(
  resumeContent: any,
  jobDescription?: string,
  industry?: string
): Promise<KeywordAnalysisResult> {
  try {
    const res = await apiRequest('POST', '/api/ai/keyword-analysis', {
      resumeContent,
      jobDescription,
      industry,
    });

    return await res.json();
  } catch (error) {
    console.error('Error analyzing resume keywords:', error);
    throw error;
  }
}

/**
 * Sends a chat message to the AI assistant for resume advice
 * 
 * @param {string} message - The user's message to the AI assistant
 * @param {object} resumeState - The current state of the resume
 * @param {any} resumeState.content - The content of the resume
 * @param {string} resumeState.templateId - The ID of the selected template
 * @param {ChatMessage[]} chatHistory - The history of previous chat messages
 * @param {string} [model="gemini"] - The AI model to use (gemini or openai)
 * @param {object} [templateConfig={}] - The current template configuration
 * @returns {Promise<ChatResponse>} A promise that resolves to the AI response and optional updates
 * @throws {Error} If the chat request fails
 */
export async function sendChatMessage(
  message: string,
  resumeState: { content: any; templateId: string },
  chatHistory: ChatMessage[],
  model: "gemini" | "openai" = "gemini",
  templateConfig: any = {}
): Promise<ChatResponse> {
  try {
    const res = await apiRequest('POST', '/api/chat', {
      message,
      resumeState,
      chatHistory,
      model,
      templateConfig
    });

    return await res.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}