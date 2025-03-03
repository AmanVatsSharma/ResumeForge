import { db } from "../../../db";
import { withAuth } from "../../../middlewares/auth";

// Schema for template configuration
const configSchema = {
  font: String,
  colorScheme: String,
  layoutStyle: String,
  showBorders: Boolean,
};

// Route to get template configuration
export const GET = withAuth(async (req, res, session) => {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/")[3]; // Extract resume ID from URL path

    // Check if the resume exists and belongs to the user
    const resume = await db.resumes.findOne({
      _id: id,
      userId: session.userId,
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Return the template configuration or an empty object if none exists
    return res.status(200).json(resume.templateConfig || {});
  } catch (error) {
    console.error("Error getting template config:", error);
    return res.status(500).json({ error: "Failed to get template configuration" });
  }
});

// Route to update template configuration
export const PUT = withAuth(async (req, res, session) => {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/")[3]; // Extract resume ID from URL path
    const config = await req.json();

    // Check if the resume exists and belongs to the user
    const resume = await db.resumes.findOne({
      _id: id,
      userId: session.userId,
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Validate configuration object
    for (const [key, value] of Object.entries(config)) {
      if (!configSchema[key]) {
        return res.status(400).json({ error: `Invalid configuration key: ${key}` });
      }

      // Type checking
      const expectedType = configSchema[key].name.toLowerCase();
      const actualType = typeof value;
      
      if (
        (expectedType === "string" && actualType !== "string") ||
        (expectedType === "boolean" && actualType !== "boolean")
      ) {
        return res.status(400).json({
          error: `Invalid type for ${key}. Expected ${expectedType}, got ${actualType}`,
        });
      }
    }

    // Update the template configuration
    const updatedResume = await db.resumes.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { $set: { templateConfig: config } },
      { returnDocument: "after" }
    );

    return res.status(200).json(updatedResume.templateConfig);
  } catch (error) {
    console.error("Error updating template config:", error);
    return res.status(500).json({ error: "Failed to update template configuration" });
  }
}); 