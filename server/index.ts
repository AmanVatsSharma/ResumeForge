import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add an explicit API prefix matcher to properly route API requests
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // First register API routes
  const server = await registerRoutes(app);

  // Add error handling for API routes
  app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("API Error:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ error: message });
  });

  // Check if Gemini API key is properly configured
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables. AI features will not work!");
  } else if (!process.env.GEMINI_API_KEY.startsWith("AIza")) {
    console.error("GEMINI_API_KEY appears to be invalid. It should start with 'AIza'. AI features may not work correctly!");
  } else {
    console.log("GEMINI_API_KEY is configured");
    
    // Test the API key on startup
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Simple test request
      await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Hello" }] }],
      });
      
      console.log("✅ GEMINI_API_KEY successfully tested and is working!");
    } catch (error: any) {
      console.error("❌ GEMINI_API_KEY validation failed. AI features will not work!");
      if (error.status === 400 && error.errorDetails) {
        console.error("Error details:", JSON.stringify(error.errorDetails, null, 2));
        console.error("");
        console.error("Please make sure that:");
        console.error("1. Your API key is correct and has been copied properly");
        console.error("2. The API key has been activated for Gemini 1.5 Flash model");
        console.error("3. You have sufficient quota remaining");
        console.error("");
        console.error("You can get a new API key from: https://makersuite.google.com/app/apikey");
      } else {
        console.error("Error:", error.message || error);
      }
    }
  }
  
  // Global error handler for non-API routes - this should come AFTER API routes
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("General error:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // If API route that wasn't caught by the API error handler
    if (_req.path.startsWith('/api')) {
      res.status(status).json({ error: message });
    } else {
      // For non-API routes, respond with HTML
      res.status(status).send(`<h1>Error ${status}</h1><p>${message}</p>`);
    }
  });

  // AFTER registering all API routes, then set up the client-side routes
  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
