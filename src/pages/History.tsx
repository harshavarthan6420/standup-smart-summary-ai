
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Code, TestTube, Monitor, Settings, Home } from "lucide-react";

interface Team {
  name: string;
  path: string;
  meetingCount: number;
}

const History = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const teamConfig = [
    {
      name: "Development",
      icon: Code,
      description: "Frontend and backend development team",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50"
    },
    {
      name: "QA Automation", 
      icon: TestTube,
      description: "Quality assurance and testing automation",
      color: "bg-green-600",
      hoverColor: "hover:bg-green-700", 
      borderColor: "border-green-200",
      bgColor: "bg-green-50"
    },
    {
      name: "UI",
      icon: Monitor,
      description: "User interface and design team",
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
      borderColor: "border-purple-200", 
      bgColor: "bg-purple-50"
    },
    {
      name: "DevOps",
      icon: Settings,
      description: "Infrastructure and deployment operations",
      color: "bg-orange-600",
      hoverColor: "hover:bg-orange-700",
      borderColor: "border-orange-200",
      bgColor: "bg-orange-50"
    }
  ];

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/teams');
        if (response.ok) {
          const data = await response.json();
          setTeams(data);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        // Fallback to default teams if backend is not available
        setTeams([
          { name: "Development", path: "development", meetingCount: 0 },
          { name: "QA Automation", path: "qa-automation", meetingCount: 0 },
          { name: "UI", path: "ui", meetingCount: 0 },
          { name: "DevOps", path: "devops", meetingCount: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleTeamClick = (teamPath: string) => {
    navigate(`/team/${teamPath}`);
  };

  const getTeamConfig = (teamName: string) => {
    return teamConfig.find(config => config.name === teamName) || teamConfig[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading teams...</p>
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Team History
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Select a team to view their standup meeting history and summaries
          </p>
        </div>

        {/* Team Selection Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {teams.map((team) => {
            const config = getTeamConfig(team.name);
            const IconComponent = config.icon;
            return (
              <Card 
                key={team.name}
                className={`${config.borderColor} ${config.bgColor} border-2 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
                onClick={() => handleTeamClick(team.path)}
              >
                <CardHeader className="text-center pb-6">
                  <div className={`w-16 h-16 ${config.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-slate-900">{team.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {config.description}
                  </p>
                  <p className="text-sm text-slate-500 mb-6">
                    {team.meetingCount} meetings recorded
                  </p>
                  <Button 
                    className={`${config.color} ${config.hoverColor} text-white w-full shadow-md`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Team History
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="mt-12 border-slate-200 bg-white shadow-lg">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              About Team History
            </h3>
            <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Each team maintains its own history of standup meetings and summaries. 
              Click on a team to view their latest activities, previous meetings, and 
              detailed breakdowns of each standup session.
            </p>
          </CardContent>
        </Card>
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

export default History;
