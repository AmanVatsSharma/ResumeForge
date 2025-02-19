import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertResumeSchema } from "@shared/schema";
import { z } from "zod";
import { generateContent } from "./ai";
import { initiatePhonePePayment, verifyPhonePePayment } from "./payments";

const generateContentSchema = z.object({
  section: z.string(),
  currentContent: z.string(),
});

const updateTemplateSchema = z.object({
  templateId: z.string(),
});

const purchaseSchema = z.object({
  type: z.enum(["template", "subscription"]),
  templateId: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // AI content generation endpoint - free for use within resume creation
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { section, currentContent } = generateContentSchema.parse(req.body);
      const content = await generateContent({ section, currentContent });
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

  // Create a new resume - this counts towards the free tier limit
  app.post("/api/resumes", async (req, res) => {
    const generationCount = req.session.generationCount || 0;
    const user = req.user;

    if (!user?.isPremium && generationCount >= 2) {
      return res.status(403).send("Free tier limit reached. Please sign up for premium.");
    }

    try {
      const data = insertResumeSchema.parse(req.body);
      const resume = await storage.createResume(user?.id || null, data);

      // Increment generation count only when saving a complete resume
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

  // Update resume template
  app.patch("/api/resumes/:id/template", async (req, res) => {
    const resume = await storage.getResume(parseInt(req.params.id));
    if (!resume) return res.sendStatus(404);

    // Allow updates if the resume belongs to anonymous user or the authenticated user
    if (resume.userId !== 0 && resume.userId !== req.user?.id) {
      return res.sendStatus(403);
    }

    try {
      const { templateId } = updateTemplateSchema.parse(req.body);
      const updatedResume = await storage.updateResumeTemplate(parseInt(req.params.id), templateId);
      res.json(updatedResume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        throw err;
      }
    }
  });

  // Initiate payment
  app.post("/api/payments/initiate", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }

    try {
      const { type, templateId } = purchaseSchema.parse(req.body);
      let amount = 0;

      if (type === "subscription") {
        amount = 999; // ₹999 for premium subscription
      } else if (type === "template" && templateId) {
        // Get template price based on templateId
        const templates: Record<string, number> = {
          "creative-1": 99,
          "technical-1": 199,
          "academic-1": 299,
        };
        amount = templates[templateId] || 99;
      }

      const payment = await initiatePhonePePayment(req.user.id, { type, amount, templateId });
      res.json(payment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        console.error('Payment initiation error:', err);
        res.status(500).send("Failed to initiate payment");
      }
    }
  });

  // Payment callback
  app.post("/api/payments/callback", async (req, res) => {
    try {
      const { merchantId, transactionId } = req.body;
      const result = await verifyPhonePePayment(transactionId, merchantId);

      if (result.success) {
        // Extract user ID from merchant reference
        const userId = parseInt(req.body.merchantUserId);
        await storage.updateUserPremiumStatus(userId, true);

        res.redirect("/payment-success");
      } else {
        res.redirect("/payment-failed");
      }
    } catch (err) {
      console.error('Payment callback error:', err);
      res.redirect("/payment-failed");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}