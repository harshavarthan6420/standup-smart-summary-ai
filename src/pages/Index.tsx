
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Mic, Play } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  const teams = ["development", "qa-automation", "ui", "devops"];
  const teamDisplayNames = {
    "development": "Development",
    "qa-automation": "QA Automation", 
    "ui": "UI",
    "devops": "DevOps"
  };

  const handleFileUpload = (type: "audio" | "transcript") => {
    if (!selectedTeam) {
      toast.error("Please select a team before uploading");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    
    if (type === "audio") {
      input.accept = ".wav,.mp3,.m4a,.aac,.flac";
    } else {
      input.accept = ".txt,.md";
    }

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (type === "audio") {
          processAudioFile(file);
        } else {
          processTranscriptFile(file);
        }
      }
    };
    
    input.click();
  };

  const processAudioFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      setProcessingStep("Transcribing audio...");
      
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('team', selectedTeam);
      
      const response = await fetch('http://localhost:3001/api/process-standup', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to process audio file');
      }
      
      const result = await response.json();
      setIsProcessing(false);
      navigate(`/summary/${result.id}`);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error("Failed to process audio file. Please check if the backend server is running.");
      setIsProcessing(false);
    }
  };

  const processTranscriptFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      await processTranscriptText(text);
    } catch (error) {
      console.error('Error reading transcript file:', error);
      toast.error("Failed to read transcript file");
      setIsProcessing(false);
    }
  };

  const processTranscriptText = async (text: string) => {
    setIsProcessing(true);
    
    try {
      setProcessingStep("Segmenting speakers...");
      
      const response = await fetch('http://localhost:3001/api/process-standup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          team: selectedTeam,
          transcript: text
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process transcript');
      }
      
      const result = await response.json();
      setIsProcessing(false);
      navigate(`/summary/${result.id}`);
      
    } catch (error) {
      console.error('Error processing transcript:', error);
      toast.error("Failed to process transcript. Please check if the backend server is running and OpenAI API key is configured.");
      setIsProcessing(false);
    }
  };

  const handlePasteTranscript = () => {
    if (!selectedTeam) {
      toast.error("Please select a team before submitting transcript");
      return;
    }
    if (!transcriptText.trim()) {
      toast.error("Please enter a transcript");
      return;
    }
    
    processTranscriptText(transcriptText);
  };

  const handleSampleStandup = () => {
    if (!selectedTeam) {
      toast.error("Please select a team before trying the sample");
      return;
    }
    
    // Navigate to existing sample data
    navigate("/summary/dev-20250612");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">Standup Summarizer</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/history")}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            View History
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            IBM Standup Summarizer
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Automate your daily standup summaries. Upload your meeting audio or transcript and
            get instant, speaker-wise summaries with AI-powered insights.
          </p>
        </div>

        {/* Get Started Section */}
        <Card className="mb-8 border-slate-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-900">Get Started</CardTitle>
            <CardDescription className="text-slate-600">
              Choose how you'd like to submit your standup meeting data. All files are processed securely
              and never stored.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Team Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Team</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Choose your team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {teamDisplayNames[team]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload Options */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Audio Upload */}
              <Card className="border-dashed border-2 border-slate-300 hover:border-blue-400 transition-colors">
                <CardContent className="p-6 text-center">
                  <Mic className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Upload Audio</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    .wav, .mp3, .m4a, .aac, .flac
                  </p>
                  <Button 
                    onClick={() => handleFileUpload("audio")}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                    disabled={isProcessing}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Audio
                  </Button>
                </CardContent>
              </Card>

              {/* Transcript Upload */}
              <Card className="border-dashed border-2 border-slate-300 hover:border-blue-400 transition-colors">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Upload Transcript</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    .txt, .md files
                  </p>
                  <Button 
                    onClick={() => handleFileUpload("transcript")}
                    variant="outline" 
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full"
                    disabled={isProcessing}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Transcript
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center text-slate-500 font-medium">OR</div>

            {/* Paste Transcript */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-medium text-slate-700">Paste Transcript</label>
              </div>
              <Textarea
                placeholder="Click to paste your meeting transcript..."
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                className="min-h-[120px] border-slate-300"
                disabled={isProcessing}
              />
              <Button 
                onClick={handlePasteTranscript}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                disabled={isProcessing}
              >
                Process Transcript
              </Button>
            </div>

            <div className="text-center text-slate-500 font-medium">OR</div>

            {/* Sample Standup */}
            <div className="text-center">
              <Button 
                onClick={handleSampleStandup}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                disabled={isProcessing}
              >
                <Play className="w-4 h-4 mr-2" />
                Try with a Sample Standup
              </Button>
              <p className="text-sm text-slate-500 mt-2">
                See how the app works with pre-loaded demo data from a typical daily standup meeting
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Processing Status */}
        {isProcessing && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-blue-800 font-medium">{processingStep}</p>
              <p className="text-sm text-blue-600 mt-2">This may take a few minutes for audio files...</p>
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="border-slate-200 text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Auto-Transcription</h3>
              <p className="text-sm text-slate-600">
                Powered by OpenAI Whisper for accurate speech-to-text conversion
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Speaker Identification</h3>
              <p className="text-sm text-slate-600">
                AI-powered speaker diarization to separate individual contributions
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Smart Summarization</h3>
              <p className="text-sm text-slate-600">
                IBM watsonx.ai extracts Yesterday, Today, and Blockers for each speaker
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-slate-500">
            Powered by IBM watsonx.ai & OpenAI Whisper
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Your files and transcripts are processed in-memory only and are not stored or shared.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
