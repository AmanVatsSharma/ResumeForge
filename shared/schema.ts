import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Resume content schema for type validation
 * Defines the structure of a resume's content including personal information,
 * summary, experience, education, and skills.
 */
export const resumeContentSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
  }),
  summary: z.string(),
  experience: z.string(),
  education: z.string(),
  skills: z.string(),
});

/**
 * Type definition for resume content extracted from the schema
 */
export type ResumeContent = z.infer<typeof resumeContentSchema>;

/**
 * Users table schema
 * Stores user account information including authentication details
 * and premium status.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  generationCount: integer("generation_count").default(0).notNull(),
});

/**
 * Resumes table schema
 * Stores resume data associated with users, including content,
 * template information, and creation timestamp.
 */
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  content: json("content").$type<ResumeContent>().notNull(),
  templateId: text("template_id").notNull(),
  createdAt: text("created_at").notNull(),
});

/**
 * Schema for user registration/creation
 * Includes only the fields needed for user registration (username, password)
 */
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

/**
 * Schema for resume creation
 * Includes only the fields needed to create a new resume (name, content, templateId)
 */
export const insertResumeSchema = createInsertSchema(resumes).pick({
  name: true,
  content: true,
  templateId: true,
});

/**
 * Type for user insertion data
 */
export type InsertUser = z.infer<typeof insertUserSchema>;

/**
 * Type for user data from database
 */
export type User = typeof users.$inferSelect;

/**
 * Type for resume data from database
 */
export type Resume = typeof resumes.$inferSelect;

/**
 * Type for resume insertion data
 */
export type InsertResume = z.infer<typeof insertResumeSchema>;