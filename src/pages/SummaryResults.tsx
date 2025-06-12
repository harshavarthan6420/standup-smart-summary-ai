
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, ArrowRight, AlertTriangle, Home } from "lucide-react";

const SummaryResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const team = location.state?.team || "Development";

  // Sample data based on the wireframe
  const summaryData = [
    {
      speaker: "Alice Johnson",
      initial: "A",
      time: "09:00-09:03",
      yesterday: "Completed the user authentication module and fixed the critical login bug that was affecting mobile users.",
      today: "Will work on implementing the password reset functionality and integrate it with our email service provider.",
      blockers: "No blockers at the moment.",
      rawContent: "Yesterday I finished the auth module and fixed that mobile login issue. Today I'm working on password reset integration. No blockers right now."
    },
    {
      speaker: "Bob Chen",
      initial: "B", 
      time: "09:03-09:06",
      yesterday: "Finished database migrations for the new user profile schema and updated all related API endpoints.",
      today: "Planning to develop the frontend components for the enhanced profile page and conduct thorough testing.",
      blockers: "Blocked on getting admin access to the staging environment. Need IT approval for deployment permissions.",
      rawContent: "Got the database migrations done for user profiles, updated APIs. Working on frontend components today. Still blocked on staging access - need IT approval."
    },
    {
      speaker: "Carol Martinez",
      initial: "C",
      time: "09:06-09:09", 
      yesterday: "Reviewed and merged 5 pull requests, deployed version 2.1.3 to staging environment successfully.",
      today: "Will focus on building the new monitoring dashboard and setting up automated alerts for production.",
      blockers: "No blockers. All systems are running smoothly.",
      rawContent: "Yesterday reviewed 5 PRs, deployed v2.1.3 to staging. Today working on monitoring dashboard and production alerts. No issues."
    }
  ];

  const handleDownloadCSV = () => {
    const csvData = summaryData.map(item => ({
      Speaker: item.speaker,
      Time: item.time,
      Yesterday: item.yesterday,
      Today: item.today,
      Blockers: item.blockers
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${team}_standup_summary.csv`;
    a.click();
  };

  const handleDownloadPDF = () => {
    // Simulate PDF download
    alert('PDF download would be implemented with a PDF generation library');
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
            onClick={() => navigate("/")}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Standup Summary Results
          </h1>
          <p className="text-slate-600">
            AI-generated summary from your standup meeting
          </p>
        </div>

        {/* Team Badge */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-blue-600 text-white px-4 py-2 text-lg">
            {team} Team
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="space-y-6 mb-8">
          {summaryData.map((item, index) => (
            <Card key={index} className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {item.initial}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900">{item.speaker}</CardTitle>
                      <p className="text-sm text-slate-500">{item.time}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Yesterday */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <h4 className="font-semibold text-slate-900">Yesterday</h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{item.yesterday}</p>
                  </div>

                  {/* Today */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-slate-900">Today</h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{item.today}</p>
                  </div>

                  {/* Blockers */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <h4 className="font-semibold text-slate-900">Blockers</h4>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      item.blockers.includes("No blockers") || item.blockers.includes("None") 
                        ? "text-green-700" 
                        : "text-red-700"
                    }`}>
                      {item.blockers}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button onClick={handleDownloadCSV} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            <FileText className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button 
            onClick={() => navigate("/")} 
            variant="outline" 
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Process Another Meeting
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Your files and transcripts are processed in-memory only and are not stored or shared.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-slate-500">
            Powered by IBM watsonx.ai & OpenAI Whisper
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SummaryResults;
