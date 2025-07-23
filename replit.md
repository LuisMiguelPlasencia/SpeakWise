# SpeakWise Pitch Analysis Platform

## Overview

SpeakWise is a premium, eye-catching full-stack web application that provides AI-powered sales pitch analysis for audio recordings. The application features a modern, responsive design with animated elements, glassmorphism effects, and vibrant gradients. Users can upload audio files (MP3/WAV) which are then transcribed using AssemblyAI and analyzed using OpenAI to provide detailed feedback on presentation skills, including comprehensive scoring, strengths identification, and actionable improvement suggestions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **File Handling**: Multer for multipart file uploads with validation
- **Development**: Custom Vite integration for hot module replacement

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **External Storage**: Firebase Firestore for additional data persistence

## Key Components

### Audio Processing Pipeline
1. **File Upload**: Drag-and-drop interface with file type validation (MP3/WAV, 25MB limit)
2. **Transcription**: AssemblyAI integration for speech-to-text conversion
3. **AI Analysis**: OpenAI GPT integration for pitch analysis and scoring
4. **Results Processing**: Structured analysis including scoring, strengths, and improvements

### Database Schema
- **Users Table**: Basic user management with username/password authentication
- **Pitch Analyses Table**: Comprehensive analysis storage including:
  - File metadata (name, size, duration)
  - Transcription data (text, word count, confidence, WPM)
  - Analysis results (overall score, summary, strengths, improvements)
  - Timestamps for audit trail

### UI Components
- **Premium Visual Design**: Eye-catching glassmorphism effects, animated gradients, and floating elements
- **Responsive Design**: Mobile-first approach with adaptive layouts and hover animations
- **Real-time Feedback**: Enhanced progress indicators with smooth animations and status updates
- **Interactive Elements**: Modern drag-and-drop file upload with visual feedback, comprehensive analysis reports
- **Micro-interactions**: Floating animations, glow effects, scale transitions, and gradient text effects
- **Toast Notifications**: Elegant user feedback system for actions and errors

## Data Flow

1. **File Upload**: User selects audio file through drag-and-drop interface
2. **Validation**: Client-side validation for file type and size constraints
3. **Upload Processing**: Server receives file via multer middleware
4. **Transcription**: Audio sent to AssemblyAI for speech-to-text processing
5. **AI Analysis**: Transcribed text analyzed by OpenAI for pitch evaluation
6. **Data Persistence**: Results saved to PostgreSQL database and optionally to Firebase
7. **Response Delivery**: Structured analysis data returned to client
8. **UI Updates**: Real-time progress updates and final results display

## External Dependencies

### AI Services
- **OpenAI API**: GPT models for intelligent pitch analysis and scoring
- **AssemblyAI**: High-accuracy speech-to-text transcription service

### Database Services
- **Neon Database**: Serverless PostgreSQL for primary data storage
- **Firebase**: Additional persistence layer and potential future features

### UI Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **React Hook Form**: Form handling with validation
- **React Dropzone**: File upload interface

### Development Tools
- **Drizzle ORM**: Type-safe database operations and migrations
- **TanStack Query**: Server state management and caching
- **Vite**: Fast development server and optimized production builds

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `dist/public` directory
- **Backend**: ESBuild compiles TypeScript server code to `dist` directory
- **Database**: Drizzle Kit handles schema migrations and database setup

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **API Keys**: 
  - `OPENAI_API_KEY` for AI-powered pitch analysis
  - `ASSEMBLY_AI_API_KEY` for high-quality audio transcription (currently using OpenAI Whisper as fallback)
- **Firebase**: Required Firebase configuration for cloud storage:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_PROJECT_ID`

### Production Considerations
- **File Storage**: Temporary file storage in `uploads/` directory (consider cloud storage for production)
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Security**: File type validation, size limits, and API key protection
- **Performance**: Query optimization and caching strategies implemented