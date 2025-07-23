import { FileText } from "lucide-react";

interface TranscriptionDisplayProps {
  transcription: string;
  wordCount: number;
  duration: number;
  confidence: number;
  wordsPerMinute: number;
}

export default function TranscriptionDisplay({
  transcription,
  wordCount,
  duration,
  confidence,
  wordsPerMinute
}: TranscriptionDisplayProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <FileText className="mr-3 text-brand-accent" />
        Transcription Results
      </h2>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand-accent">{wordCount}</div>
          <div className="text-white/60 text-sm">Words</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand-success">{formatDuration(duration)}</div>
          <div className="text-white/60 text-sm">Duration</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand-warning">{confidence}%</div>
          <div className="text-white/60 text-sm">Confidence</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{wordsPerMinute}</div>
          <div className="text-white/60 text-sm">WPM</div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-white font-medium mb-4">Full Transcript</h3>
        <div className="text-white/80 leading-relaxed max-h-64 overflow-y-auto">
          {transcription}
        </div>
      </div>
    </div>
  );
}
