import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { savePitchAnalysis } from "@/lib/firebase";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import ProcessingSteps from "@/components/ProcessingSteps";
import TranscriptionDisplay from "@/components/TranscriptionDisplay";
import AnalysisReport from "@/components/AnalysisReport";
import type { PitchAnalysis } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<PitchAnalysis | null>(null);
  const [transcriptionStatus, setTranscriptionStatus] = useState<'pending' | 'processing' | 'completed' | 'error'>('pending');
  const [analysisStatus, setAnalysisStatus] = useState<'pending' | 'processing' | 'completed' | 'error'>('pending');
  const [saveStatus, setSaveStatus] = useState<'pending' | 'processing' | 'completed' | 'error'>('pending');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const analyzePitchMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('audio', file);

      // Simulate upload progress
      setUploadProgress(0);
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(uploadInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      setTranscriptionStatus('processing');

      const response = await apiRequest('POST', '/api/analyze-pitch', formData);
      
      clearInterval(uploadInterval);
      setUploadProgress(100);
      
      return response.json();
    },
    onSuccess: async (data: PitchAnalysis) => {
      setTranscriptionStatus('completed');
      setAnalysisStatus('processing');
      
      // Simulate analysis progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          clearInterval(progressInterval);
          setAnalysisProgress(100);
          setAnalysisStatus('completed');
          
          // Save to Firebase
          setSaveStatus('processing');
          savePitchAnalysis(data)
            .then(() => {
              setSaveStatus('completed');
              toast({
                title: "Analysis Complete!",
                description: "Your pitch has been analyzed and saved successfully.",
              });
            })
            .catch((error) => {
              console.error('Firebase save error:', error);
              setSaveStatus('error');
              toast({
                title: "Save Warning",
                description: "Analysis completed but failed to save to Firebase.",
                variant: "destructive",
              });
            });
        } else {
          setAnalysisProgress(progress);
        }
      }, 300);
      
      setAnalysisResult(data);
    },
    onError: (error: any) => {
      setTranscriptionStatus('error');
      setAnalysisStatus('error');
      setSaveStatus('error');
      
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze your pitch. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    analyzePitchMutation.mutate(file);
  };

  const handleRecordingComplete = (audioBlob: Blob, fileName: string) => {
    // Convert blob to File object
    const audioFile = new File([audioBlob], fileName, { type: 'audio/wav' });
    setSelectedFile(audioFile);
    analyzePitchMutation.mutate(audioFile);
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your pitch analysis report is being prepared for download.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share Feature",
      description: "Share functionality will be available soon.",
    });
  };

  const handleAnalyzeAnother = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setUploadProgress(0);
    setTranscriptionStatus('pending');
    setAnalysisStatus('pending');
    setSaveStatus('pending');
    setAnalysisProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Analyze Your Sales Pitch{" "}
            <span className="bg-gradient-to-r from-brand-accent to-brand-success bg-clip-text text-transparent">
              with AI
            </span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Upload your audio, record directly in the browser, get instant transcription, and receive detailed AI-powered analysis 
            with scores, summaries, and actionable improvement tips.
          </p>
        </div>

        {/* File Upload & Recording */}
        <FileUpload
          onFileSelect={handleFileSelect}
          onRecordingComplete={handleRecordingComplete}
          isUploading={analyzePitchMutation.isPending && uploadProgress < 100}
          uploadProgress={uploadProgress}
        />

        {/* Processing Steps */}
        {selectedFile && (
          <ProcessingSteps
            transcriptionStatus={transcriptionStatus}
            analysisStatus={analysisStatus}
            saveStatus={saveStatus}
            analysisProgress={analysisProgress}
          />
        )}

        {/* Transcription Results */}
        {analysisResult && (
          <TranscriptionDisplay
            transcription={analysisResult.transcription || ''}
            wordCount={analysisResult.wordCount || 0}
            duration={analysisResult.duration || 0}
            confidence={analysisResult.confidence || 0}
            wordsPerMinute={analysisResult.wordsPerMinute || 0}
          />
        )}

        {/* Analysis Report */}
        {analysisResult && analysisStatus === 'completed' && (
          <AnalysisReport
            overallScore={analysisResult.overallScore || 0}
            summary={analysisResult.summary || ''}
            strengths={analysisResult.strengths || []}
            improvements={analysisResult.improvements || []}
            onDownload={handleDownload}
            onShare={handleShare}
            onAnalyzeAnother={handleAnalyzeAnother}
          />
        )}
      </div>
    </div>
  );
}
