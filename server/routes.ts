import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertResumeSchema } from "@shared/schema";
import { z } from "zod";
import { generateContent } from "./ai";

const generateContentSchema = z.object({
  section: z.string(),
  prompt: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // AI content generation endpoint
  app.post("/api/ai/generate", async (req, res) => {
    // Get generation count from session for anonymous users
    const generationCount = req.session.generationCount || 0;
    const user = req.user;

    // Check if user has exceeded free tier limit
    if (!user?.isPremium && generationCount >= 2) {
      return res.status(403).send("Free tier limit reached. Please sign up for premium.");
    }

    try {
      const { section, prompt } = generateContentSchema.parse(req.body);
      const content = await generateContent({ section, prompt });

      // Increment generation count for anonymous users
      if (!user) {
        req.session.generationCount = generationCount + 1;
      } else {
        await storage.updateUserGenerationCount(user.id);
      }

      res.json({ content });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        console.error('Error generating content:', err);
        res.status(500).send("Failed to generate content");
      }
    }
  });

  // Get all user's resumes
  app.get("/api/resumes", async (req, res) => {
    const userId = req.user?.id || null;
    const resumes = await storage.getUserResumes(userId);
    res.json(resumes);
  });

  // Create a new resume
  app.post("/api/resumes", async (req, res) => {
    const generationCount = req.session.generationCount || 0;
    const user = req.user;

    if (!user?.isPremium && generationCount >= 2) {
      return res.status(403).send("Free tier limit reached. Please sign up for premium.");
    }

    try {
      const data = insertResumeSchema.parse(req.body);
      const resume = await storage.createResume(user?.id || null, data);

      // Increment generation count
      if (!user) {
        req.session.generationCount = generationCount + 1;
      } else {
        await storage.updateUserGenerationCount(user.id);
      }

      res.status(201).json(resume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        throw err;
      }
    }
  });

  // Get a single resume
  app.get("/api/resumes/:id", async (req, res) => {
    const resume = await storage.getResume(parseInt(req.params.id));
    if (!resume) return res.sendStatus(404);

    // Allow access if the resume belongs to anonymous user or the authenticated user
    if (resume.userId !== 0 && resume.userId !== req.user?.id) {
      return res.sendStatus(403);
    }

    res.json(resume);
  });

  const httpServer = createServer(app);
  return httpServer;
}