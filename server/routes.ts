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
    if (!req.isAuthenticated()) return res.sendStatus(401);

    if (!req.user.isPremium && req.user.generationCount >= 2) {
      return res.status(403).send("Free tier limit reached");
    }

    try {
      const { section, prompt } = generateContentSchema.parse(req.body);
      const content = await generateContent({ section, prompt });
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
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const resumes = await storage.getUserResumes(req.user.id);
    res.json(resumes);
  });

  // Create a new resume
  app.post("/api/resumes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    if (!req.user.isPremium && req.user.generationCount >= 2) {
      return res.status(403).send("Free tier limit reached");
    }

    try {
      const data = insertResumeSchema.parse(req.body);
      const resume = await storage.createResume(req.user.id, data);
      await storage.updateUserGenerationCount(req.user.id);
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
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const resume = await storage.getResume(parseInt(req.params.id));
    if (!resume) return res.sendStatus(404);
    if (resume.userId !== req.user.id) return res.sendStatus(403);

    res.json(resume);
  });

  const httpServer = createServer(app);
  return httpServer;
}