import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPitchAnalysisSchema } from "@shared/schema";
import multer from "multer";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3 and WAV files are allowed.'));
    }
  }
});

// Initialize OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
});

// Initialize AssemblyAI (using fetch since no official SDK in dependencies)
const ASSEMBLY_AI_API_KEY = process.env.ASSEMBLY_AI_API_KEY || process.env.VITE_ASSEMBLY_AI_API_KEY;

async function transcribeAudio(audioPath: string): Promise<{
  text: string;
  confidence: number;
  words: number;
  duration: number;
}> {
  try {
    // Upload audio file to AssemblyAI
    const audioData = fs.readFileSync(audioPath);
    
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLY_AI_API_KEY || '',
        'content-type': 'application/octet-stream',
      },
      body: audioData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio to AssemblyAI');
    }

    const { upload_url } = await uploadResponse.json();

    // Request transcription
    const transcriptionResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLY_AI_API_KEY || '',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        language_model: 'default',
      }),
    });

    if (!transcriptionResponse.ok) {
      throw new Error('Failed to request transcription');
    }

    const { id } = await transcriptionResponse.json();

    // Poll for transcription completion
    let transcription;
    do {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: {
          'authorization': ASSEMBLY_AI_API_KEY || '',
        },
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to check transcription status');
      }

      transcription = await statusResponse.json();
    } while (transcription.status === 'processing' || transcription.status === 'queued');

    if (transcription.status === 'error') {
      throw new Error('Transcription failed: ' + transcription.error);
    }

    const words = transcription.text.split(' ').length;
    const duration = transcription.audio_duration || 0;

    return {
      text: transcription.text,
      confidence: Math.round((transcription.confidence || 0.95) * 100),
      words,
      duration,
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio: ' + (error as Error).message);
  }
}

async function analyzePitch(transcription: string): Promise<{
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert sales pitch analyzer. Analyze the given sales pitch transcription and provide:
1. An overall score from 1-10 (10 being excellent)
2. A brief summary of the pitch
3. Exactly 2 key strengths
4. Exactly 2 areas for improvement

Respond with JSON in this exact format:
{
  "score": number,
  "summary": "string",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`
        },
        {
          role: "user",
          content: `Please analyze this sales pitch transcription:\n\n${transcription}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      score: Math.max(1, Math.min(10, Math.round(result.score || 5))),
      summary: result.summary || 'Analysis unavailable',
      strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 2) : ['Unable to analyze strengths'],
      improvements: Array.isArray(result.improvements) ? result.improvements.slice(0, 2) : ['Unable to analyze improvements'],
    };
  } catch (error) {
    console.error('Pitch analysis error:', error);
    throw new Error('Failed to analyze pitch: ' + (error as Error).message);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload and analyze audio file
  app.post("/api/analyze-pitch", upload.single('audio'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const audioPath = req.file.path;
      const fileName = req.file.originalname;
      const fileSize = req.file.size;

      // Step 1: Transcribe audio
      const transcriptionResult = await transcribeAudio(audioPath);
      
      // Step 2: Analyze pitch
      const analysisResult = await analyzePitch(transcriptionResult.text);
      
      // Calculate words per minute
      const wordsPerMinute = transcriptionResult.duration > 0 
        ? Math.round((transcriptionResult.words * 60) / transcriptionResult.duration)
        : 0;

      // Step 3: Save to storage
      const pitchAnalysis = await storage.createPitchAnalysis({
        userId: null, // No user system implemented yet
        fileName,
        fileSize,
        duration: transcriptionResult.duration,
        transcription: transcriptionResult.text,
        wordCount: transcriptionResult.words,
        confidence: transcriptionResult.confidence,
        wordsPerMinute,
        overallScore: analysisResult.score,
        summary: analysisResult.summary,
        strengths: analysisResult.strengths,
        improvements: analysisResult.improvements,
      });

      // Clean up uploaded file
      fs.unlinkSync(audioPath);

      res.json(pitchAnalysis);
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Clean up file if it exists
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('File cleanup error:', cleanupError);
        }
      }
      
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze pitch" 
      });
    }
  });

  // Get all pitch analyses
  app.get("/api/pitch-analyses", async (req, res) => {
    try {
      const analyses = await storage.getUserPitchAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error('Get analyses error:', error);
      res.status(500).json({ message: "Failed to retrieve analyses" });
    }
  });

  // Get specific pitch analysis
  app.get("/api/pitch-analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getPitchAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error('Get analysis error:', error);
      res.status(500).json({ message: "Failed to retrieve analysis" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
