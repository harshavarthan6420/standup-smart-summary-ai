
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Calendar, ArrowRight, AlertTriangle, Home } from "lucide-react";

interface StandupSummary {
  speaker: string;
  initial: string;
  time: string;
  yesterday: string;
  today: string;
  blockers: string;
  rawContent: string;
}

interface StandupData {
  id: string;
  date: string;
  team: string;
  summary: StandupSummary[];
}

const SummaryResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { standupId } = useParams();
  const [standupData, setStandupData] = useState<StandupData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStandupData = async () => {
      try {
        if (standupId) {
          const response = await fetch(`http://localhost:3001/api/standups/${standupId}`);
          if (response.ok) {
            const data = await response.json();
            setStandupData(data);
          }
        } else if (location.state?.standupData) {
          setStandupData(location.state.standupData);
        }
      } catch (error) {
        console.error('Error fetching standup data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandupData();
  }, [standupId, location.state]);

  const handleDownloadCSV = () => {
    if (!standupData) return;
    
    const csvData = standupData.summary.map(item => ({
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
    a.download = `${standupData.team}_standup_summary_${standupData.date.replace(/\//g, '-')}.csv`;
    a.click();
  };

  const handleDownloadPDF = () => {
    alert('PDF download would be implemented with a PDF generation library');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading standup summary...</p>
        </div>
      </div>
    );
  }

  if (!standupData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Standup summary not found</p>
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Standup Summary Results
          </h1>
          <p className="text-slate-600">
            AI-generated summary from your standup meeting
          </p>
        </div>

        {/* Team Badge and Date */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <Badge className="bg-blue-600 text-white px-4 py-2 text-lg">
            {standupData.team} Team
          </Badge>
          <Badge variant="outline" className="border-slate-300 px-4 py-2 text-lg">
            {standupData.date}
          </Badge>
        </div>

        {/* Summary Table */}
        <Card className="border-slate-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Meeting Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-slate-900">Speaker</TableHead>
                    <TableHead className="font-semibold text-slate-900">Time</TableHead>
                    <TableHead className="font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Yesterday</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="w-4 h-4" />
                        <span>Today</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Blockers</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standupData.summary.map((item, index) => (
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {item.initial}
                          </div>
                          <span className="font-medium text-slate-900">{item.speaker}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{item.time}</TableCell>
                      <TableCell className="text-sm text-slate-700 max-w-xs">
                        <p className="leading-relaxed">{item.yesterday}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700 max-w-xs">
                        <p className="leading-relaxed">{item.today}</p>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs">
                        <p className={`leading-relaxed ${
                          item.blockers.includes("No blockers") || item.blockers.includes("None") 
                            ? "text-green-700" 
                            : "text-red-700"
                        }`}>
                          {item.blockers}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

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
