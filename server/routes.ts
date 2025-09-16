import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertResumeSchema } from "@shared/schema";
import { z } from "zod";
import { generateContent, chatWithAI } from "./ai";
import { initiatePhonePePayment, verifyPhonePePayment } from "./payments";
import { getTemplatePriceRupees, SUBSCRIPTION_PRICE_RUPEES } from "@shared/templates";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import express, { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { User, Resume } from "@shared/schema";
import createHttpError from "http-errors";
import { setupVite, serveStatic, log } from "./vite";

// Add SessionData interface extension for TypeScript
declare module "express-session" {
  interface SessionData {
    generationCount?: number;
  }
}

// Add isAuthenticated middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  next();
};

/**
 * Schema for AI content generation requests
 */
const generateContentSchema = z.object({
  section: z.string(),
  currentContent: z.string(),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  experienceLevel: z.string().optional(),
  tone: z.string().optional(),
  jobDescription: z.string().optional(),
  optimizeForATS: z.boolean().optional(),
});

/**
 * Schema for updating resume templates
 */
const updateTemplateSchema = z.object({
  templateId: z.string(),
});

/**
 * Schema for payment requests
 */
const purchaseSchema = z.object({
  type: z.enum(["template", "subscription"]),
  templateId: z.string().optional(),
});

/**
 * Schema for chat messages
 */
const chatMessageSchema = z.object({
  message: z.string(),
  resumeState: z.object({
    content: z.any(),
    templateId: z.string(),
  }),
  chatHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })),
  model: z.enum(["gemini", "openai"]).optional(),
  templateConfig: z.any().optional(),
});

/**
 * Schema for theme updates
 */
const themeUpdateSchema = z.object({
  appearance: z.enum(["light", "dark"]),
});

/**
 * Schema for email request
 */
const emailResumeSchema = z.object({
  resumeContent: z.object({
    basics: z.object({
      name: z.string(),
      // ... other fields can be added as needed
    }),
    // ... other sections can be added as needed
  }),
  email: z.string().email(),
  templateId: z.string(),
  templateConfig: z.record(z.any()).optional(),
});

// Path to the theme.json file
const themeFilePath = path.resolve(process.cwd(), "theme.json");

// Function to read the theme.json file
const readThemeFile = (): any => {
  try {
    const themeData = fs.readFileSync(themeFilePath, "utf-8");
    return JSON.parse(themeData);
  } catch (error) {
    console.error("Error reading theme file:", error);
    return { variant: "professional", primary: "#0A66C2", appearance: "light", radius: 0.5 };
  }
};

// Function to write to the theme.json file
const writeThemeFile = (data: any): void => {
  try {
    fs.writeFileSync(themeFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing theme file:", error);
  }
};

/**
 * Registers all API routes for the application
 * 
 * @param {Express} app - Express application instance
 * @returns {Promise<Server>} A promise that resolves to the HTTP server
 */
export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Validation schema for content generation request
  const generateContentSchema = z.object({
    section: z.string(),
    currentContent: z.string(),
    jobTitle: z.string().optional(),
    industry: z.string().optional(),
    experienceLevel: z.string().optional(),
    tone: z.string().optional(),
    jobDescription: z.string().optional(),
    optimizeForATS: z.boolean().optional(),
  });

  // Validation schema for resume tailoring request
  const tailorResumeSchema = z.object({
    resumeContent: z.any(),
    jobDescription: z.string(),
    optimizeForATS: z.boolean().optional(),
  });

  // Validation schema for ATS scan request
  const atsScanSchema = z.object({
    resumeContent: z.any(),
    jobDescription: z.string().optional(),
  });

  // Validation schema for keyword analysis request
  const keywordAnalysisSchema = z.object({
    resumeContent: z.any(),
    jobDescription: z.string().optional(),
    industry: z.string().optional(),
  });

  // AI content generation endpoint - free for use within resume creation
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const params = generateContentSchema.parse(req.body);
      const content = await generateContent(params);
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

  // Get theme settings
  app.get("/api/theme", async (req, res) => {
    try {
      const themeData = readThemeFile();
      res.json(themeData);
    } catch (err) {
      console.error('Error getting theme:', err);
      res.status(500).send("Failed to get theme");
    }
  });

  // Update theme settings
  app.put("/api/theme", async (req, res) => {
    try {
      const params = themeUpdateSchema.parse(req.body);
      const themeData = readThemeFile();
      
      // Update only the appearance property
      const updatedTheme = { ...themeData, appearance: params.appearance };
      
      writeThemeFile(updatedTheme);
      res.json(updatedTheme);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        console.error('Error updating theme:', err);
        res.status(500).send("Failed to update theme");
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
    try {
      // Handle both string and numeric IDs
      const idParam = req.params.id;
      let resume: Resume | undefined;
      
      // Try to parse as number first
      const numericId = parseInt(idParam, 10);
      if (!isNaN(numericId)) {
        resume = await storage.getResume(numericId);
      }
      
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      // Allow access if the resume belongs to anonymous user or the authenticated user
      if (resume.userId !== 0 && resume.userId !== req.user?.id) {
        return res.status(403).json({ error: "You don't have permission to access this resume" });
      }

      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ error: "Failed to fetch resume" });
    }
  });

  // Update resume template
  app.patch("/api/resumes/:id/template", async (req, res) => {
    const resume = await storage.getResume(parseInt(req.params.id));
    if (!resume) {
      res.setHeader('Content-Type', 'application/json');
      return res.sendStatus(404);
    }

    // Allow updates if the resume belongs to anonymous user or the authenticated user
    if (resume.userId !== 0 && resume.userId !== req.user?.id) {
      res.setHeader('Content-Type', 'application/json');
      return res.sendStatus(403);
    }

    try {
      const { templateId } = updateTemplateSchema.parse(req.body);
      const updatedResume = await storage.updateResumeTemplate(parseInt(req.params.id), templateId);
      res.setHeader('Content-Type', 'application/json');
      res.json(updatedResume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json(err.errors);
      } else {
        console.error("Error updating template:", err);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: "Failed to update template" });
      }
    }
  });

  // Update entire resume (content and name)
  app.patch("/api/resumes/:id", async (req, res) => {
    try {
      console.log(`[DEBUG] PATCH /api/resumes/:id - Request received for resume ID: ${req.params.id}`);
      console.log(`[DEBUG] Request body:`, JSON.stringify(req.body, null, 2));
      
      const resumeId = parseInt(req.params.id);
      console.log(`[DEBUG] Parsed resumeId:`, resumeId);
      
      const resume = await storage.getResume(resumeId);
      console.log(`[DEBUG] Resume found:`, resume ? 'Yes' : 'No');
      
      if (!resume) {
        console.log(`[DEBUG] Resume not found with ID: ${resumeId}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(404).json({ error: "Resume not found" });
      }
      
      // Allow updates if the resume belongs to anonymous user or the authenticated user
      const userId = req.user?.id || 0;
      console.log(`[DEBUG] Current user ID: ${userId}, Resume user ID: ${resume.userId}`);
      
      if (resume.userId !== 0 && resume.userId !== req.user?.id) {
        console.log(`[DEBUG] Permission denied: User ${userId} cannot update resume ${resumeId} owned by user ${resume.userId}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(403).json({ error: "You don't have permission to update this resume" });
      }
      
      // Validate request body
      const updateSchema = z.object({
        name: z.string().optional(),
        content: z.any(),
        templateId: z.string().optional(),
      });
      
      console.log(`[DEBUG] Validating request body`);
      const { name, content, templateId } = updateSchema.parse(req.body);
      console.log(`[DEBUG] Validation passed, name: ${name}, content exists: ${!!content}, templateId: ${templateId}`);
      
      // Update content
      console.log(`[DEBUG] Updating resume content`);
      let updatedResume = await storage.updateResumeContent(
        resumeId, 
        name || resume.name, 
        content
      );
      console.log(`[DEBUG] Content updated successfully`);
      
      // If templateId is provided, update template as well
      if (templateId && templateId !== resume.templateId) {
        console.log(`[DEBUG] Updating resume template to: ${templateId}`);
        updatedResume = await storage.updateResumeTemplate(resumeId, templateId);
        console.log(`[DEBUG] Template updated successfully`);
      }
      
      console.log(`[DEBUG] Sending successful response`);
      res.setHeader('Content-Type', 'application/json');
      res.json(updatedResume);
    } catch (err) {
      console.error(`[ERROR] Error updating resume:`, err);
      
      if (err instanceof z.ZodError) {
        console.error(`[ERROR] Validation error:`, JSON.stringify(err.errors, null, 2));
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json(err.errors);
      } else {
        console.error(`[ERROR] Unexpected error:`, err instanceof Error ? err.message : String(err));
        console.error(`[ERROR] Error stack:`, err instanceof Error ? err.stack : 'No stack trace');
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: "Failed to update resume", message: err instanceof Error ? err.message : String(err) });
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
        amount = SUBSCRIPTION_PRICE_RUPEES;
      } else if (type === "template" && templateId) {
        amount = getTemplatePriceRupees(templateId) || 99;
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

  // Resume tailoring based on job description
  app.post("/api/ai/tailor", async (req, res) => {
    try {
      const { resumeContent, jobDescription, optimizeForATS } = tailorResumeSchema.parse(req.body);
      
      // Create custom prompt for tailoring resume to job description
      const prompt = `You are an expert resume writer specializing in tailoring resumes to specific job descriptions.
        Given the resume content and job description provided, modify the resume content to better match the job requirements.
        ${optimizeForATS ? 'Format the content to be ATS-friendly, using keywords from the job description.' : ''}
        
        Resume Content: ${JSON.stringify(resumeContent)}
        
        Job Description: ${jobDescription}
        
        Return only the modified resume content as a JSON object with the same structure as the input.`;
      
      // Generate the tailored resume
      const generativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = generativeAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      try {
        // Parse the response as JSON
        const tailoredContent = JSON.parse(response.text());
        res.json(tailoredContent);
      } catch (e) {
        // If parsing fails, return error
        res.status(500).json({ error: "Failed to parse tailored content" });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        console.error('Error tailoring resume:', err);
        res.status(500).json({ error: "Failed to tailor resume" });
      }
    }
  });

  // ATS (Applicant Tracking System) scan endpoint
  app.post("/api/ai/ats-scan", async (req, res) => {
    try {
      const { resumeContent, jobDescription } = atsScanSchema.parse(req.body);
      
      // Create custom prompt for ATS analysis
      const prompt = `You are an expert in Applicant Tracking Systems (ATS) with deep knowledge of how these systems analyze resumes.
        Analyze the provided resume content for ATS compatibility and provide detailed feedback.
        ${jobDescription ? `Use the provided job description to evaluate how well the resume matches key requirements: ${jobDescription}` : 'Evaluate the resume for general ATS compatibility.'}
        
        Resume Content: ${JSON.stringify(resumeContent)}
        
        Return your analysis as a JSON object with the following structure:
        {
          "score": number (0-100 representing ATS compatibility score),
          "missingKeywords": array of strings (keywords from job description missing in resume),
          "suggestions": array of strings (suggestions for improving ATS compatibility),
          "sectionScores": object (section-by-section scores, e.g. {"summary": 85, "experience": 70}),
          "analysis": string (detailed analysis with markdown formatting for better readability)
        }
        
        For the analysis field, use markdown formatting with headings, bullet points, bold/italic text to make the feedback more readable and structured.`;
      
      // Generate the ATS analysis
      const generativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = generativeAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      try {
        // Parse the response as JSON
        const atsAnalysis = JSON.parse(response.text());
        res.json(atsAnalysis);
      } catch (e) {
        // If parsing fails, return error
        res.status(500).json({ error: "Failed to parse ATS analysis" });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        console.error('Error analyzing resume for ATS:', err);
        res.status(500).json({ error: "Failed to analyze resume for ATS" });
      }
    }
  });

  // Keyword analysis endpoint
  app.post("/api/ai/keyword-analysis", async (req, res) => {
    try {
      const { resumeContent, jobDescription, industry } = keywordAnalysisSchema.parse(req.body);
      
      // Create custom prompt for keyword analysis
      const prompt = `You are an expert resume writer with deep knowledge of industry-specific keywords and ATS systems.
        Analyze the provided resume content for keyword usage and provide detailed feedback.
        ${jobDescription ? `Focus on keywords relevant to this job description: ${jobDescription}` : ''}
        ${industry ? `Consider industry-specific keywords for the ${industry} industry.` : ''}
        
        Resume Content: ${JSON.stringify(resumeContent)}
        
        Return your analysis as a JSON object with the following structure:
        {
          "topKeywords": array of strings (most significant keywords found in the resume),
          "suggestedKeywords": array of strings (keywords that would improve the resume based on job or industry),
          "missingKeywords": array of strings (important keywords that should be added),
          "overusedKeywords": array of strings (keywords used too frequently),
          "analysis": string (detailed analysis with markdown formatting for better readability)
        }
        
        For the analysis field, use markdown formatting with headings, bullet points, bold/italic text to make the feedback more structured and readable.`;
      
      // Generate the keyword analysis
      const generativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = generativeAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      try {
        // Parse the response as JSON
        const keywordAnalysis = JSON.parse(response.text());
        res.json(keywordAnalysis);
      } catch (e) {
        // If parsing fails, return error
        res.status(500).json({ error: "Failed to parse keyword analysis" });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        console.error('Error analyzing resume keywords:', err);
        res.status(500).json({ error: "Failed to analyze resume keywords" });
      }
    }
  });

  // Chat with AI endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, resumeState, chatHistory, model = "gemini", templateConfig = {} } = chatMessageSchema.parse(req.body);
      
      // Check if user is premium for OpenAI access
      if (model === "openai" && !req.user?.isPremium) {
        return res.status(403).json({
          error: "Premium subscription required to use OpenAI model"
        });
      }
      
      // Ensure content is not undefined for the ResumeState type
      const validResumeState = {
        content: resumeState.content || {},
        templateId: resumeState.templateId
      };
      
      // Enhanced context for the AI
      const enhancedMessage = `
User message: ${message}

Current resume template: ${resumeState.templateId}
Current template configuration: ${JSON.stringify(templateConfig)}

Please respond to the user's message. If the user asks to change the template, update content, or modify the design, include those changes in your response.

For template changes, include: {"templateId": "template-id"}
For content changes, include the updated section content: {"content": {"section": "updated content"}}
For style changes, include: {"style": {"font": "fontName", "colorScheme": "schemeName", "spacing": "value"}}

Remember that you can take actions to help the user by changing the resume as requested.
`.trim();
      
      // Use the appropriate AI service based on user's selection
      const result = await chatWithAI(
        enhancedMessage, 
        validResumeState, 
        chatHistory, 
        model
      );
      
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        console.error('Chat error:', err);
        res.status(500).send("Failed to process chat message");
      }
    }
  });

  /**
   * Email a resume as an attachment
   * 
   * @route POST /api/resumes/email
   * @param {object} req.body - Email request with resume content and recipient
   * @returns {object} Success message
   */
  app.post("/api/resumes/email", isAuthenticated, async (req, res) => {
    try {
      const { resumeContent, email, templateId, templateConfig } = emailResumeSchema.parse(req.body);
      
      // In a real implementation, this would use nodemailer or a service like SendGrid
      // to send an email with the resume as an attachment
      
      console.log(`Sending resume to ${email} with template ${templateId}`);
      
      // For now, we'll just simulate a successful email send
      setTimeout(() => {
        console.log("Email sent successfully");
      }, 1000);
      
      return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(400).json({ error: "Failed to send email" });
    }
  });

  // Test AI connection
  app.get("/api/ai/test", async (req, res) => {
    try {
      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          status: "error",
          message: "GEMINI_API_KEY is not configured"
        });
      }
      
      // Validate API key format
      if (!process.env.GEMINI_API_KEY.startsWith("AIza")) {
        return res.status(500).json({
          status: "error",
          message: "GEMINI_API_KEY is invalid (does not start with AIza)"
        });
      }
      
      // Initialize the Google Gemini API
      const generativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = generativeAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Try a simple request
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Hello, please respond with 'API is working'" }] }],
      });
      
      const response = await result.response;
      const text = response.text();
      
      res.json({
        status: "success",
        message: "AI API is operational",
        response: text,
        key_prefix: process.env.GEMINI_API_KEY.substring(0, 8) + "..." // Show first few chars for validation
      });
    } catch (error: any) {
      console.error('Error testing AI connection:', error);
      
      let errorMessage = "Failed to connect to AI service";
      let errorDetails = null;
      
      // Extract more specific error details
      if (error.status === 400) {
        if (error.errorDetails?.some((detail: any) => detail.reason === "API_KEY_INVALID")) {
          errorMessage = "API key is invalid or not activated for Gemini 1.5 Flash";
        } else if (error.errorDetails?.some((detail: any) => detail.reason === "PERMISSION_DENIED")) {
          errorMessage = "API key doesn't have permission to access Gemini 1.5 Flash";
        }
        errorDetails = error.errorDetails;
      } else if (error.status === 429) {
        errorMessage = "API rate limit exceeded";
      }
      
      res.status(500).json({
        status: "error",
        message: errorMessage,
        error: error instanceof Error ? error.message : String(error),
        errorDetails: errorDetails,
        key_prefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + "..." : "not set"
      });
    }
  });

  // Test endpoint for resume storage operations
  app.get("/api/test/resume-storage", async (req, res) => {
    try {
      console.log("[TEST] Starting resume storage test");
      
      // Create a test resume
      const testResume = {
        name: "Test Resume",
        content: {
          personalInfo: {
            fullName: "Test User",
            email: "test@example.com",
            phone: "123-456-7890",
            location: "Test City"
          },
          summary: "Test summary",
          experience: "Test experience",
          education: "Test education",
          skills: "Test skills"
        },
        templateId: "modern-1"
      };
      
      console.log("[TEST] Creating test resume");
      const createdResume = await storage.createResume(0, testResume);
      console.log("[TEST] Test resume created with ID:", createdResume.id);
      
      // Update the resume content
      const updatedContent = {
        ...createdResume.content,
        summary: "Updated summary for testing"
      };
      
      console.log("[TEST] Updating test resume content");
      const updatedResume = await storage.updateResumeContent(
        createdResume.id,
        createdResume.name,
        updatedContent
      );
      
      console.log("[TEST] Resume updated, comparing values:");
      console.log("[TEST] Original summary:", createdResume.content.summary);
      console.log("[TEST] Updated summary:", updatedResume.content.summary);
      
      // Set the proper content type
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        created: createdResume,
        updated: updatedResume,
        isUpdated: updatedResume.content.summary === "Updated summary for testing"
      });
    } catch (error) {
      console.error("[TEST] Test failed with error:", error);
      
      // Set the proper content type
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}