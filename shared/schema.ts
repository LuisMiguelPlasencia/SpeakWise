import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const pitchAnalyses = pgTable("pitch_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  duration: integer("duration"), // in seconds
  transcription: text("transcription"),
  wordCount: integer("word_count"),
  confidence: integer("confidence"), // percentage
  wordsPerMinute: integer("words_per_minute"),
  overallScore: integer("overall_score"), // 1-10
  summary: text("summary"),
  strengths: text("strengths").array(),
  improvements: text("improvements").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPitchAnalysisSchema = createInsertSchema(pitchAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPitchAnalysis = z.infer<typeof insertPitchAnalysisSchema>;
export type PitchAnalysis = typeof pitchAnalyses.$inferSelect;
