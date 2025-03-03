import { db } from "../../db";

// Route to get a shared resume by ID
export const GET = async (req: Request, res: Response) => {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    
    if (!id) {
      return res.status(400).json({ error: "Resume ID is required" });
    }

    // Get the resume by ID - note that this is a public endpoint, so we don't check for user ownership
    const resume = await db.resumes.findOne({ _id: id });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Return the resume data
    return res.status(200).json(resume);
  } catch (error) {
    console.error("Error getting shared resume:", error);
    return res.status(500).json({ error: "Failed to get shared resume" });
  }
}; 