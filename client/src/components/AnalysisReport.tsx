import { TrendingUp, Lightbulb, ThumbsUp, ArrowUp, Download, Share, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisReportProps {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  onDownload?: () => void;
  onShare?: () => void;
  onAnalyzeAnother?: () => void;
}

export default function AnalysisReport({
  overallScore,
  summary,
  strengths,
  improvements,
  onDownload,
  onShare,
  onAnalyzeAnother
}: AnalysisReportProps) {
  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent Performance";
    if (score >= 6) return "Good Performance";
    if (score >= 4) return "Fair Performance";
    return "Needs Improvement";
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-brand-success";
    if (score >= 6) return "text-brand-warning";
    return "text-brand-error";
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <TrendingUp className="mr-3 text-brand-success" />
        Pitch Analysis Report
      </h2>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-xl p-6 mb-8 border border-brand-primary/30">
        <div className="text-center">
          <div className="text-6xl font-bold text-white mb-2">{overallScore.toFixed(1)}</div>
          <div className="text-xl text-white/80 mb-2">Overall Pitch Score</div>
          <div className={`font-medium ${getScoreColor(overallScore)}`}>
            {getScoreLabel(overallScore)}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Lightbulb className="mr-2 text-brand-warning" />
          Executive Summary
        </h3>
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <p className="text-white/80 leading-relaxed">{summary}</p>
        </div>
      </div>

      {/* Strengths and Improvements Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Strengths */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <ThumbsUp className="mr-2 text-brand-success" />
            Key Strengths
          </h3>
          <div className="space-y-4">
            {strengths.map((strength, index) => (
              <div key={index} className="bg-brand-success/10 border border-brand-success/30 rounded-lg p-4">
                <h4 className="font-semibold text-brand-success mb-2">Strength {index + 1}</h4>
                <p className="text-white/70 text-sm">{strength}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <ArrowUp className="mr-2 text-brand-warning" />
            Improvement Areas
          </h3>
          <div className="space-y-4">
            {improvements.map((improvement, index) => (
              <div key={index} className="bg-brand-warning/10 border border-brand-warning/30 rounded-lg p-4">
                <h4 className="font-semibold text-brand-warning mb-2">Improvement {index + 1}</h4>
                <p className="text-white/70 text-sm">{improvement}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-white/10">
        <Button 
          onClick={onDownload}
          className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center justify-center"
        >
          <Download className="mr-2 w-4 h-4" />
          Download Report (PDF)
        </Button>
        <Button 
          onClick={onShare}
          variant="outline"
          className="bg-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center"
        >
          <Share className="mr-2 w-4 h-4" />
          Share Results
        </Button>
        <Button 
          onClick={onAnalyzeAnother}
          variant="outline"
          className="bg-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center"
        >
          <RotateCcw className="mr-2 w-4 h-4" />
          Analyze Another Pitch
        </Button>
      </div>
    </div>
  );
}
