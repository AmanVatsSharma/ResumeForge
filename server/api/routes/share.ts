import { z } from "zod";
import { db } from "../db";
import { withAuth } from "../middlewares/auth";
import { sendEmail } from "../services/email";

// Schema for share email request
const shareEmailSchema = z.object({
  resumeId: z.string(),
  recipientEmail: z.string().email(),
  message: z.string().optional(),
});

// Route to send a resume share email
export const POST = withAuth(async (req, res, session) => {
  try {
    const body = await req.json();
    const { resumeId, recipientEmail, message } = shareEmailSchema.parse(body);

    // Check if the resume exists and belongs to the user
    const resume = await db.resumes.findOne({
      _id: resumeId,
      userId: session.userId,
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Generate a share link
    const baseUrl = process.env.PUBLIC_CLIENT_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/share/${resumeId}`;

    // Send the email
    await sendEmail({
      to: recipientEmail,
      subject: `${session.user.name} has shared a resume with you`,
      html: `
        <div>
          <p>${session.user.name} has shared their resume "${resume.name}" with you.</p>
          ${message ? `<p>Message: "${message}"</p>` : ""}
          <p>View the resume here: <a href="${shareUrl}">${shareUrl}</a></p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Error sharing resume:", error);
    return res.status(500).json({ error: "Failed to share resume" });
  }
}); 