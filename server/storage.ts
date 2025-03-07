import { User, Resume, InsertUser, InsertResume } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private currentUserId: number;
  private currentResumeId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.currentUserId = 1;
    this.currentResumeId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isPremium: false,
      generationCount: 0,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserGenerationCount(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.generationCount += 1;
      this.users.set(userId, user);
    }
  }

  async updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.isPremium = isPremium;
      this.users.set(userId, user);
    }
  }

  async createResume(userId: number | null, insertResume: InsertResume): Promise<Resume> {
    const id = this.currentResumeId++;
    const resume: Resume = {
      ...insertResume,
      id,
      userId: userId || 0, // Use 0 for anonymous users
      createdAt: new Date().toISOString(),
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async getUserResumes(userId: number | null): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(
      (resume) => resume.userId === (userId || 0),
    );
  }

  async updateResumeTemplate(id: number, templateId: string): Promise<Resume> {
    const resume = await this.getResume(id);
    if (!resume) {
      throw new Error("Resume not found");
    }

    const updatedResume = {
      ...resume,
      templateId,
    };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  async updateResumeContent(id: number, name: string, content: any): Promise<Resume> {
    console.log(`[STORAGE] updateResumeContent called for resume ID: ${id}`);
    console.log(`[STORAGE] Resume exists in storage: ${this.resumes.has(id)}`);
    
    const resume = await this.getResume(id);
    if (!resume) {
      console.log(`[STORAGE] Resume not found with ID: ${id}`);
      throw new Error("Resume not found");
    }
    
    console.log(`[STORAGE] Original resume:`, JSON.stringify({
      id: resume.id,
      name: resume.name,
      userId: resume.userId,
      templateId: resume.templateId,
      contentKeys: Object.keys(resume.content || {})
    }, null, 2));
    
    const updatedResume = {
      ...resume,
      name,
      content,
    };
    
    console.log(`[STORAGE] Updated resume:`, JSON.stringify({
      id: updatedResume.id,
      name: updatedResume.name,
      userId: updatedResume.userId,
      templateId: updatedResume.templateId,
      contentKeys: Object.keys(updatedResume.content || {})
    }, null, 2));
    
    this.resumes.set(id, updatedResume);
    console.log(`[STORAGE] Resume updated successfully with ID: ${id}`);
    
    return updatedResume;
  }
}

export const storage = new MemStorage();