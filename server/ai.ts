import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the provided key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

type GenerateParams = {
  section: string;
  currentContent: string;
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ResumeState {
  content: any;
  templateId: string;
}

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

export async function chatWithAI(
  message: string,
  resumeState: ResumeState,
  chatHistory: ChatMessage[]
): Promise<{ response: string; updates?: Partial<ResumeState> }> {
  try {
    const prompt = `You are an AI resume assistant helping a user with their resume.
    Your goal is to help them improve their resume's content and design.

    Current resume state:
    ${JSON.stringify(resumeState, null, 2)}

    Chat history:
    ${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

    User message: ${message}

    Respond in JSON format with:
    1. A helpful, natural response to the user
    2. Any updates to make to the resume (if requested)

    Example response format:
    {
      "response": "I've updated your summary to be more impactful...",
      "updates": {
        "content": {
          "summary": "Updated text here..."
        }
      }
    }

    Remember to be helpful, professional, and make changes only when explicitly requested.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const response = await result.response;

    try {
      return JSON.parse(response.text());
    } catch (e) {
      return { response: response.text() };
    }
  } catch (error) {
    console.error('Error chatting with AI:', error);
    throw new Error('Failed to process chat message');
  }
}