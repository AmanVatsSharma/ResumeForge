import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

/**
 * Function to get a fresh instance of the Gemini API model
 * This ensures we always use the most current API key from environment variables
 */
function getGeminiModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// Initialize OpenAI service if API key is available (for premium users)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

/**
 * Parameters for generating content with AI
 * @interface GenerateParams
 * @property {string} section - The resume section to generate content for (e.g., "summary", "experience")
 * @property {string} currentContent - The current content of the section, if any
 * @property {string} [jobTitle] - Optional job title for targeted content
 * @property {string} [industry] - Optional industry for targeted content
 * @property {string} [experienceLevel] - Optional experience level (entry, mid, senior)
 * @property {string} [tone] - Optional tone for content (professional, creative, academic)
 */
type GenerateParams = {
  section: string;
  currentContent: string;
  jobTitle?: string;
  industry?: string;
  experienceLevel?: string;
  tone?: string;
};

/**
 * Interface for chat messages
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Interface for resume state
 */
export interface ResumeState {
  content: {
    summary: string;
    experience: string[];
    education: string[];
    skills: string[];
  };
  templateId: string;
}

/**
 * AI model type - Gemini or OpenAI
 */
export type AIModel = "gemini" | "openai";

/**
 * Generates advanced prompts based on the section and provided context
 * 
 * @param {GenerateParams} params - Parameters for content generation
 * @returns {string} The generated prompt
 */
function generatePrompt(params: GenerateParams): string {
  const { section, currentContent, jobTitle, industry, experienceLevel, tone } = params;
  
  // Base context with expertise definition
  let prompt = `You are a professional resume writer with over 15 years of experience helping people get their dream jobs. `;
  
  // Add expertise context based on industry
  if (industry) {
    prompt += `You specialize in ${industry} industry resumes and understand the specific terminology, skills, and achievements that hiring managers in this field look for. `;
  }
  
  // Add job targeting if provided
  if (jobTitle) {
    prompt += `Your task is to create content optimized for a ${jobTitle} position${industry ? ` in the ${industry} industry` : ''}. `;
  }

  // Add experience level context
  if (experienceLevel) {
    switch(experienceLevel.toLowerCase()) {
      case 'entry':
        prompt += `The content should be appropriate for an entry-level professional with 0-2 years of experience, focusing on education, internships, transferable skills, and demonstrating potential. `;
        break;
      case 'mid':
        prompt += `The content should be appropriate for a mid-level professional with 3-7 years of experience, highlighting growing responsibilities, key achievements, and specialized skills. `;
        break;
      case 'senior':
        prompt += `The content should be appropriate for a senior-level professional with 8+ years of experience, emphasizing leadership, strategic contributions, and high-impact accomplishments. `;
        break;
    }
  }

  // Add tone guidance
  if (tone) {
    switch(tone.toLowerCase()) {
      case 'professional':
        prompt += `Use a professional, formal tone with strong action verbs and precise language. `;
        break;
      case 'creative':
        prompt += `Use a creative yet professional tone that stands out while maintaining credibility. `;
        break;
      case 'academic':
        prompt += `Use an academic tone appropriate for research, teaching, or scholarly positions. `;
        break;
    }
  }

  // Section-specific instructions
  switch(section.toLowerCase()) {
    case 'summary':
      prompt += `
Create a compelling professional summary for the resume that:
- Is 3-4 sentences long and serves as a powerful introduction
- Starts with a strong professional title (e.g., "Experienced Marketing Director" or "Detail-oriented Software Engineer")
- Highlights the candidate's years of experience, core competencies, and unique value proposition
- Includes 2-3 notable achievements with quantifiable results when possible
- Incorporates industry-specific keywords and avoids generic statements
- Uses first-person implied voice (no "I" or "me") with powerful action verbs
- Ends with a statement about what the professional aims to accomplish for the potential employer

${currentContent ? `Here's the current summary to improve: "${currentContent}"` : ''}

Write ONLY the summary text with no additional comments or explanations. Do not include the heading "Summary" or "Professional Summary".`;
      break;
    
    case 'experience':
      prompt += `
Create an impactful bullet point for a work experience section that:
- Starts with a strong action verb in the appropriate tense
- Clearly describes a specific responsibility or achievement
- Includes quantifiable results where possible (numbers, percentages, dollar amounts)
- Demonstrates the impact or benefit of the action
- Uses industry-relevant terminology
- Is concise (1-2 lines) but comprehensive
- Avoids first-person language and unnecessary words

${currentContent ? `Here's the current content to improve: "${currentContent}"` : ''}

Write ONLY the experience bullet point with no additional comments or explanations.`;
      break;
    
    case 'education':
      prompt += `
Create a clear education entry for the resume that:
- Follows standard formatting for education sections
- Lists the degree, field of study, institution, and graduation year
- Includes honors, relevant coursework, or GPA if notable (3.5 or higher)
- Is concise but complete
- Uses proper abbreviations for degrees when appropriate

${currentContent ? `Here's the current education entry to improve: "${currentContent}"` : ''}

Write ONLY the education entry with no additional comments or explanations.`;
      break;
    
    case 'skills':
      prompt += `
Create a well-organized skills list that:
- Includes a mix of technical/hard skills and soft skills relevant to the target position
- Prioritizes the most in-demand skills for the industry
- Uses industry-standard terminology and avoids generic skills
- Groups related skills together in a logical way
- Is formatted as a clean, scannable list or sections
- Includes proficiency levels for technical skills if appropriate

${currentContent ? `Here's the current skills section to improve: "${currentContent}"` : ''}

Write ONLY the skills list with no additional comments or explanations.`;
      break;
    
    default:
      prompt += `
Generate high-quality, professional content for the ${section} section of a resume that:
- Is tailored to the industry and position
- Uses strong, active language with appropriate keywords
- Includes specific, quantifiable achievements when possible
- Is concise but comprehensive
- Follows standard resume best practices
- Is optimized for ATS (Applicant Tracking Systems)

${currentContent ? `Here's the current content to improve: "${currentContent}"` : ''}

Write ONLY the content with no additional comments or explanations.`;
  }
  
  return prompt;
}

/**
 * Generates content for a resume section using AI
 * 
 * @param {GenerateParams} params - Parameters for generation
 * @returns {Promise<string>} - The generated content
 */
export async function generateContent(params: GenerateParams): Promise<string> {
  try {
    const prompt = generatePrompt(params);
    // Get a fresh instance of the Gemini model for each request
    const geminiModel = getGeminiModel();
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content");
  }
}

/**
 * Processes a chat message from the user about their resume and provides AI assistance
 * 
 * Uses either Google's Gemini model or OpenAI based on the user's subscription level
 * and can suggest updates to the resume content when requested.
 * 
 * @param {string} message - The user's message
 * @param {ResumeState} resumeState - The current state of the user's resume
 * @param {ChatMessage[]} chatHistory - The history of previous chat messages
 * @param {AIModel} model - The AI model to use (gemini or openai)
 * @returns {Promise<{response: string, updates?: Partial<ResumeState>}>} A promise that resolves to the AI response and optional resume updates
 * @throws {Error} If processing the chat message fails
 */
export async function chatWithAI(
  message: string,
  resumeState: ResumeState,
  chatHistory: ChatMessage[],
  model: AIModel = "gemini"
): Promise<{ response: string; updates?: Partial<ResumeState> }> {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return { 
        response: "I'm sorry, but the AI service is not properly configured. Please contact support."
      };
    }

    if (!process.env.GEMINI_API_KEY.startsWith("AIza")) {
      console.error('GEMINI_API_KEY appears to be invalid (does not start with AIza)');
      return { 
        response: "The AI service configuration appears to be invalid. Please check your API key format."
      };
    }

    const prompt = `You are an AI resume assistant with expertise in career development, resume writing, and job application strategy.
    Your goal is to help the user improve their resume's content, formatting, and overall effectiveness.
    
    You can provide specific advice about improving each section, optimizing for ATS (Applicant Tracking Systems), and tailoring the resume for specific job targets.
    
    When responding:
    1. Be professional but conversational and encouraging
    2. Provide specific, actionable advice rather than generic tips
    3. When the user asks for content changes, provide well-crafted replacements they can use directly
    4. Focus on helping them stand out with achievement-oriented content
    5. Suggest quantifiable metrics when appropriate
    6. Use markdown formatting in your responses for better readability (e.g., **bold**, *italic*, bullet points)
    7. When you want to suggest changes to a specific section, ask explicitly with a question like "Shall I update your [section] section?" to enable interactive buttons in the UI
    8. When suggesting improvements to content, be specific about which section you're referring to

    IMPORTANT: For interactive elements to work properly, when suggesting changes to resume content:
    1. ALWAYS end your message with a clear yes/no question like "Shall I update your summary section?" or "Would you like me to improve your experience bullet points?"
    2. Use EXACTLY this phrasing pattern: "Shall I update your [section] section?" where [section] is replaced with the exact section name (summary, experience, education, skills)
    3. This specific phrasing is required for the UI to display interactive buttons to the user

    Current resume state:
    ${JSON.stringify(resumeState, null, 2)}

    Chat history:
    ${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

    User message: ${message}

    Respond with a JSON object containing:
    1. A helpful, natural response to the user (can include markdown formatting)
    2. Any updates to make to the resume (only when explicitly requested)

    Example response format:
    {
      "response": "I've updated your summary to be more impactful by focusing on your key accomplishments and unique value proposition. The new version highlights your leadership experience and quantifies your achievements.",
      "updates": {
        "content": {
          "summary": "Results-driven Marketing Manager with 5+ years of experience developing award-winning campaigns that increased customer engagement by 45% and drove $2M+ in revenue growth. Expertise in digital marketing, brand development, and team leadership, with a proven track record of executing data-driven strategies that align with business objectives."
        },
        "templateId": "executive-1"
      }
    }

    Only include the "updates" field when the user has explicitly requested changes to their resume content or template. Otherwise, just provide advice and guidance.`;

    let responseText: string;

    // Use the appropriate AI model based on the user's selection
    if (model === "openai" && openai) {
      // Use OpenAI for premium users
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",  // Using GPT-4 for premium users
          messages: [
            {
              role: "system",
              content: "You are an AI resume assistant that helps users improve their resumes."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          temperature: 0.7,
        });
        
        responseText = completion.choices[0]?.message.content || 
          "I apologize, but I wasn't able to process your request. Please try again.";
      } catch (openaiError) {
        console.error('Error with OpenAI API:', openaiError);
        return { 
          response: "I encountered an issue with the OpenAI service. Falling back to standard responses. Please try again later."
        };
      }
    } else {
      // Use Gemini (default)
      try {
        // Get a fresh instance of the Gemini model for each request
        const geminiModel = getGeminiModel();
        const result = await geminiModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        const response = await result.response;
        responseText = response.text();
      } catch (geminiError: any) {
        console.error('Error with Gemini API:', geminiError);
        
        // Provide specific error messages based on error details
        if (geminiError.status === 400) {
          if (geminiError.errorDetails?.some((detail: any) => detail.reason === "API_KEY_INVALID")) {
            return { 
              response: "There's an issue with the Gemini API key. It appears to be invalid or not activated for Gemini 1.5 Flash. Please check your API key configuration and ensure it has access to the Gemini 1.5 Flash model."
            };
          }
          if (geminiError.errorDetails?.some((detail: any) => detail.reason === "PERMISSION_DENIED")) {
            return { 
              response: "Your Gemini API key doesn't have permission to access the Gemini 1.5 Flash model. Please verify permissions in your Google AI Studio account."
            };
          }
        }
        
        if (geminiError.status === 429) {
          return { 
            response: "The Gemini API service is currently rate limited. This could be due to exceeding quota or usage limits. Please try again later."
          };
        }
        
        // Generic fallback for other errors
        return { 
          response: "I'm having trouble connecting to the AI service right now. This might be due to API issues or network problems. Please try again in a few moments."
        };
      }
    }

    try {
      // Clean up the response if it contains markdown code blocks
      if (responseText.includes("```json")) {
        // Extract JSON content from Markdown code blocks
        const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          responseText = jsonMatch[1];
        }
      }
      
      // Remove any remaining markdown formatting that might interfere with parsing
      responseText = responseText.replace(/^```[\s\S]*?```$/gm, '').trim();
      
      // Parse the response as JSON
      const jsonResponse = JSON.parse(responseText);
      
      // If the response includes markdown code blocks that are not part of JSON syntax, convert them
      if (jsonResponse.response) {
        // Ensure code blocks are properly formatted
        jsonResponse.response = jsonResponse.response
          .replace(/```(\w+)\n/g, "```$1\n")
          .replace(/```\n/g, "```\n");
      }
      
      return jsonResponse;
    } catch (e) {
      // If parsing fails, return just the text response with markdown formatting
      console.error('Error parsing AI response as JSON:', e);
      
      // Format the response for markdown
      const formattedResponse = responseText
        .replace(/\*\*/g, "**") // Ensure bold syntax is preserved
        .replace(/\*/g, "*")     // Ensure italic syntax is preserved
        .replace(/\n- /g, "\n- "); // Ensure list items are formatted
        
      return { response: formattedResponse };
    }
  } catch (error) {
    console.error('Error chatting with AI:', error);
    return { response: "Sorry, I encountered an unexpected error. Please try again later." };
  }
}