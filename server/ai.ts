import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the provided key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

type GenerateParams = {
  section: string;
  currentContent: string;
};

export async function generateContent({ section, currentContent }: GenerateParams): Promise<string> {
  try {
    const basePrompt = `You are a professional resume writer. Enhance and improve the following ${section} section of a resume. 
    The content should be professional, concise, and highlight key achievements.

    Current content:
    ${currentContent || "No content provided"}

    Please enhance this content while maintaining its core information. If no content is provided, generate a professional example.`;

    const result = await model.generateContent(basePrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error('Failed to generate content');
  }
}