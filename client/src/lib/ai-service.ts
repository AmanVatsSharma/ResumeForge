import { z } from "zod";

const generateContentSchema = z.object({
  content: z.string(),
});

type GenerateContentResponse = z.infer<typeof generateContentSchema>;

export async function generateContent(section: string, currentContent: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        section,
        currentContent,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to generate content: ${res.statusText}`);
    }

    const data = generateContentSchema.parse(await res.json());
    return data.content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}