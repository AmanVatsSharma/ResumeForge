import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the provided key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

type GenerateParams = {
  section: string;
  prompt: string;
};

export async function generateContent({ section, prompt }: GenerateParams): Promise<string> {
  try {
    const basePrompt = `You are a professional resume writer. Generate content for the ${section} section of a resume. The content should be professional, concise, and highlight key achievements. Here's the context: ${prompt}`;

    const result = await model.generateContent(basePrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error('Failed to generate content');
  }
}
