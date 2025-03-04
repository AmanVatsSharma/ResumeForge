import { User, Resume, InsertUser, InsertResume } from "@shared/schema";
import session from "express-session";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { pgTable, serial, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { eq, sql } from 'drizzle-orm';

// Define the database schema
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  isPremium: boolean('isPremium').notNull().default(false),
  generationCount: integer('generationCount').notNull().default(0),
});

const resumes = pgTable('resumes', {
  id: serial('id').primaryKey(),
  userId: integer('userId').notNull(),
  name: text('name').notNull(),
  templateId: text('templateId').notNull(),
  content: jsonb('content').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// Create database connection
const dbConnection = neon(process.env.DATABASE_URL!);
const db = drizzle(dbConnection);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserGenerationCount(userId: number): Promise<void>;
  updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<void>;

  createResume(userId: number | null, resume: InsertResume): Promise<Resume>;
  getResume(id: number): Promise<Resume | undefined>;
  getUserResumes(userId: number | null): Promise<Resume[]>;
  updateResumeTemplate(id: number, templateId: string): Promise<Resume>;
  updateResumeContent(id: number, name: string, content: any): Promise<Resume>;

  sessionStore: session.Store;
}

export class Storage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Use PostgreSQL session store in production
    const PostgresStore = require('connect-pg-simple')(session);
    this.sessionStore = new PostgresStore({
      conString: process.env.DATABASE_URL,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] ? {
      ...result[0],
      id: Number(result[0].id),
      isPremium: Boolean(result[0].isPremium),
      generationCount: Number(result[0].generationCount)
    } as User : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] ? {
      ...result[0],
      id: Number(result[0].id),
      isPremium: Boolean(result[0].isPremium),
      generationCount: Number(result[0].generationCount)
    } as User : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      username: insertUser.username,
      password: insertUser.password,
      isPremium: false,
      generationCount: 0
    }).returning();
    
    return {
      ...result[0],
      id: Number(result[0].id),
      isPremium: Boolean(result[0].isPremium),
      generationCount: Number(result[0].generationCount)
    } as User;
  }

  async updateUserGenerationCount(userId: number): Promise<void> {
    await db.update(users)
      .set({ 
        generationCount: sql`${users.generationCount} + 1`
      })
      .where(eq(users.id, userId));
  }

  async updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<void> {
    await db.update(users)
      .set({ isPremium })
      .where(eq(users.id, userId));
  }

  async createResume(userId: number | null, insertResume: InsertResume): Promise<Resume> {
    const result = await db.insert(resumes).values({
      userId: userId || 0,
      name: insertResume.name,
      templateId: insertResume.templateId,
      content: insertResume.content,
    }).returning();
    
    return {
      ...result[0],
      id: Number(result[0].id),
      userId: Number(result[0].userId),
      templateId: result[0].templateId,
      createdAt: new Date(result[0].createdAt).toISOString()
    } as Resume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const result = await db.select().from(resumes).where(eq(resumes.id, id));
    return result[0] ? {
      ...result[0],
      id: Number(result[0].id),
      userId: Number(result[0].userId),
      templateId: result[0].templateId,
      createdAt: new Date(result[0].createdAt).toISOString()
    } as Resume : undefined;
  }

  async getUserResumes(userId: number | null): Promise<Resume[]> {
    const results = await db.select().from(resumes).where(eq(resumes.userId, userId || 0));
    return results.map(result => ({
      ...result,
      id: Number(result.id),
      userId: Number(result.userId),
      templateId: result.templateId,
      createdAt: new Date(result.createdAt).toISOString()
    })) as Resume[];
  }

  async updateResumeTemplate(id: number, templateId: string): Promise<Resume> {
    const result = await db.update(resumes)
      .set({ templateId })
      .where(eq(resumes.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error("Resume not found");
    }

    return {
      ...result[0],
      id: Number(result[0].id),
      userId: Number(result[0].userId),
      templateId: result[0].templateId,
      createdAt: new Date(result[0].createdAt).toISOString()
    } as Resume;
  }

  async updateResumeContent(id: number, name: string, content: any): Promise<Resume> {
    console.log(`[STORAGE] updateResumeContent called for resume ID: ${id}`);
    
    const result = await db.update(resumes)
      .set({ name, content })
      .where(eq(resumes.id, id))
      .returning();
    
    if (!result[0]) {
      console.log(`[STORAGE] Resume not found with ID: ${id}`);
      throw new Error("Resume not found");
    }
    
    console.log(`[STORAGE] Resume updated successfully with ID: ${id}`);
    return {
      ...result[0],
      id: Number(result[0].id),
      userId: Number(result[0].userId),
      templateId: result[0].templateId,
      createdAt: new Date(result[0].createdAt).toISOString()
    } as Resume;
  }
}

// Export a singleton instance
export const storage = new Storage();