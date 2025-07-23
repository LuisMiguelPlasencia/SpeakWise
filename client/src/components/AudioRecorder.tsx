import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, fileName: string) => void;
  isProcessing?: boolean;
}

export default function AudioRecorder({ onRecordingComplete, isProcessing = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setHasRecording(true);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const playRecording = () => {
    if (audioRef.current && audioURL) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
      }
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setHasRecording(false);
    setIsPlaying(false);
    setRecordingTime(0);
  };

  const useRecording = () => {
    if (audioURL && chunksRef.current.length > 0) {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
      const fileName = `recorded-pitch-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`;
      onRecordingComplete(audioBlob, fileName);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <Mic className="mr-3 text-brand-accent" />
        Record Your Sales Pitch
      </h2>

      {/* Recording Controls */}
      <div className="text-center space-y-6">
        {/* Timer Display */}
        <div className="text-4xl font-bold text-white mb-4">
          {formatTime(recordingTime)}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-center space-x-2 text-brand-error">
            <div className="w-3 h-3 bg-brand-error rounded-full animate-pulse"></div>
            <span className="font-medium">
              {isPaused ? 'Recording Paused' : 'Recording...'}
            </span>
          </div>
        )}

        {/* Main Recording Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording && !hasRecording && (
            <Button
              onClick={startRecording}
              disabled={isProcessing}
              className="bg-brand-error hover:bg-brand-error/80 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            >
              <Mic />
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                onClick={pauseRecording}
                className="bg-brand-warning hover:bg-brand-warning/80 text-white w-12 h-12 rounded-full flex items-center justify-center"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={stopRecording}
                className="bg-brand-error hover:bg-brand-error/80 text-white w-16 h-16 rounded-full flex items-center justify-center"
              >
                <Square className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>

        {/* Recording Playback Controls */}
        {hasRecording && audioURL && (
          <div className="space-y-4">
            <audio ref={audioRef} src={audioURL} className="hidden" />
            
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={playRecording}
                className="bg-brand-primary hover:bg-brand-primary/80 text-white w-12 h-12 rounded-full flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={deleteRecording}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-brand-error/20 hover:border-brand-error w-12 h-12 rounded-full flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={useRecording}
                disabled={isProcessing}
                className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                <Download className="mr-2 w-4 h-4" />
                Use This Recording
              </Button>
              
              <Button
                onClick={() => {
                  deleteRecording();
                  startRecording();
                }}
                disabled={isProcessing}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-8 py-3 rounded-lg font-medium"
              >
                <Mic className="mr-2 w-4 h-4" />
                Record Again
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isRecording && !hasRecording && (
          <div className="text-white/60 text-sm max-w-md mx-auto">
            Click the microphone to start recording your sales pitch. 
            Make sure you're in a quiet environment for the best results.
          </div>
        )}
      </div>
    </div>
  );
}