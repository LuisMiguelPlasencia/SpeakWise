import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, FileAudio, X, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AudioRecorder from "./AudioRecorder";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onRecordingComplete: (audioBlob: Blob, fileName: string) => void;
  isUploading: boolean;
  uploadProgress: number;
}

export default function FileUpload({ onFileSelect, onRecordingComplete, isUploading, uploadProgress }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false,
  });

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile && !isUploading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8 animate-slide-up">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <CloudUpload className="mr-3 text-brand-accent" />
          Ready to Analyze
        </h2>
        
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileAudio className="text-brand-accent text-xl" />
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-white/60 text-sm">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button 
              onClick={removeFile}
              className="text-brand-error hover:text-red-400 transition-colors"
            >
              <X />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8 animate-slide-up">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <CloudUpload className="mr-3 text-brand-accent" />
          Processing Your Pitch
        </h2>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Uploading...</span>
            <span className="text-white/60 text-sm">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full h-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8 animate-slide-up">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <CloudUpload className="w-4 h-4" />
            <span>Upload File</span>
          </TabsTrigger>
          <TabsTrigger value="record" className="flex items-center space-x-2">
            <Mic className="w-4 h-4" />
            <span>Record Audio</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <CloudUpload className="mr-3 text-brand-accent" />
            Upload Your Sales Pitch
          </h2>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer bg-gradient-to-b from-brand-accent/5 to-transparent transition-colors ${
              isDragActive 
                ? 'border-brand-accent' 
                : 'border-brand-accent/50 hover:border-brand-accent'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-brand-accent/20 rounded-full flex items-center justify-center mb-4">
                <CloudUpload className="text-3xl text-brand-accent" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                {isDragActive ? 'Drop your audio file here' : 'Drop your audio file here'}
              </h3>
              <p className="text-white/60">or click to browse files</p>
              <p className="text-sm text-white/40">Supports MP3, WAV files up to 25MB</p>
              <Button className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow">
                Choose File
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="record" className="space-y-6">
          <AudioRecorder 
            onRecordingComplete={onRecordingComplete}
            isProcessing={isUploading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
