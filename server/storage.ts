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
  
  createResume(userId: number, resume: InsertResume): Promise<Resume>;
  getResume(id: number): Promise<Resume | undefined>;
  getUserResumes(userId: number): Promise<Resume[]>;
  
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
      user.generationCount++;
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

  async createResume(userId: number, insertResume: InsertResume): Promise<Resume> {
    const id = this.currentResumeId++;
    const resume: Resume = {
      ...insertResume,
      id,
      userId,
      createdAt: new Date().toISOString(),
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async getUserResumes(userId: number): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(
      (resume) => resume.userId === userId,
    );
  }
}

export const storage = new MemStorage();
