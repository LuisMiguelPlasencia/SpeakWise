import { pitchAnalyses, type PitchAnalysis, type InsertPitchAnalysis, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPitchAnalysis(analysis: InsertPitchAnalysis): Promise<PitchAnalysis>;
  getPitchAnalysis(id: number): Promise<PitchAnalysis | undefined>;
  getUserPitchAnalyses(userId?: number): Promise<PitchAnalysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pitchAnalyses: Map<number, PitchAnalysis>;
  private currentUserId: number;
  private currentAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.pitchAnalyses = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPitchAnalysis(insertAnalysis: InsertPitchAnalysis): Promise<PitchAnalysis> {
    const id = this.currentAnalysisId++;
    const analysis: PitchAnalysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
      summary: insertAnalysis.summary || null,
      duration: insertAnalysis.duration || null,
      transcription: insertAnalysis.transcription || null,
      wordCount: insertAnalysis.wordCount || null,
      confidence: insertAnalysis.confidence || null,
      wordsPerMinute: insertAnalysis.wordsPerMinute || null,
      overallScore: insertAnalysis.overallScore || null,
      strengths: insertAnalysis.strengths || null,
      improvements: insertAnalysis.improvements || null,
    };
    this.pitchAnalyses.set(id, analysis);
    return analysis;
  }

  async getPitchAnalysis(id: number): Promise<PitchAnalysis | undefined> {
    return this.pitchAnalyses.get(id);
  }

  async getUserPitchAnalyses(userId?: number): Promise<PitchAnalysis[]> {
    const analyses = Array.from(this.pitchAnalyses.values());
    if (userId) {
      return analyses.filter(analysis => analysis.userId === userId);
    }
    return analyses;
  }
}

export const storage = new MemStorage();
