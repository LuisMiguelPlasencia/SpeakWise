import { Check, Brain, Save, Cog, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProcessingStepsProps {
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'error';
  analysisStatus: 'pending' | 'processing' | 'completed' | 'error';
  saveStatus: 'pending' | 'processing' | 'completed' | 'error';
  analysisProgress?: number;
}

export default function ProcessingSteps({ 
  transcriptionStatus, 
  analysisStatus, 
  saveStatus,
  analysisProgress = 0
}: ProcessingStepsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="text-white text-sm" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <X className="text-white text-sm" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-brand-success';
      case 'processing':
        return 'bg-brand-warning animate-pulse-slow';
      case 'error':
        return 'bg-brand-error';
      default:
        return 'bg-white/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'In Progress';
      case 'error':
        return 'Error';
      default:
        return 'Pending';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-brand-success';
      case 'processing':
        return 'text-brand-warning';
      case 'error':
        return 'text-brand-error';
      default:
        return 'text-white/40';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <Cog className="mr-3 text-brand-warning" />
        Processing Status
      </h2>

      <div className="space-y-6">
        {/* Step 1: Transcription */}
        <div className="flex items-center space-x-4">
          <div className={`w-8 h-8 ${getStatusColor(transcriptionStatus)} rounded-full flex items-center justify-center flex-shrink-0`}>
            {getStatusIcon(transcriptionStatus)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Audio Transcription</h3>
              <span className={`text-sm font-medium ${getStatusTextColor(transcriptionStatus)}`}>
                {getStatusText(transcriptionStatus)}
              </span>
            </div>
            <p className="text-white/60 text-sm">Converting speech to text using AssemblyAI</p>
          </div>
        </div>

        {/* Step 2: AI Analysis */}
        <div className="flex items-center space-x-4">
          <div className={`w-8 h-8 ${getStatusColor(analysisStatus)} rounded-full flex items-center justify-center flex-shrink-0`}>
            <Brain className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">AI Analysis</h3>
              <span className={`text-sm font-medium ${getStatusTextColor(analysisStatus)}`}>
                {getStatusText(analysisStatus)}
              </span>
            </div>
            <p className="text-white/60 text-sm">Analyzing pitch quality with OpenAI GPT-4</p>
            {analysisStatus === 'processing' && (
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                <Progress value={analysisProgress} className="h-1.5" />
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Save Results */}
        <div className="flex items-center space-x-4">
          <div className={`w-8 h-8 ${getStatusColor(saveStatus)} rounded-full flex items-center justify-center flex-shrink-0`}>
            <Save className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium ${saveStatus === 'pending' ? 'text-white/60' : 'text-white'}`}>
                Save to Firebase
              </h3>
              <span className={`text-sm font-medium ${getStatusTextColor(saveStatus)}`}>
                {getStatusText(saveStatus)}
              </span>
            </div>
            <p className={`text-sm ${saveStatus === 'pending' ? 'text-white/40' : 'text-white/60'}`}>
              Storing results in your dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
