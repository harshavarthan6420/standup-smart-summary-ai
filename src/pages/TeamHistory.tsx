
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Home, Search, Calendar, ArrowRight, AlertTriangle, ChevronDown, ChevronUp, Code, TestTube, Monitor, Settings, Eye } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface StandupSummary {
  speaker: string;
  initial: string;
  time: string;
  yesterday: string;
  today: string;
  blockers: string;
  rawContent: string;
}

interface StandupMeeting {
  id: string;
  date: string;
  isToday?: boolean;
  team: string;
  summary: StandupSummary[];
}

const TeamHistory = () => {
  const { teamName } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMeetings, setExpandedMeetings] = useState<string[]>([]);
  const [meetings, setMeetings] = useState<StandupMeeting[]>([]);
  const [teams, setTeams] = useState<Array<{name: string, path: string, icon: any}>>([]);
  const [loading, setLoading] = useState(true);

  const formattedTeamName = teamName?.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Development";

  const teamIcons = [
    { name: "Development", icon: Code, path: "development" },
    { name: "QA Automation", icon: TestTube, path: "qa-automation" }, 
    { name: "UI", icon: Monitor, path: "ui" },
    { name: "DevOps", icon: Settings, path: "devops" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch team history
        if (teamName) {
          const historyResponse = await fetch(`http://localhost:3001/api/teams/${teamName}/history`);
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            setMeetings(historyData);
          }
        }

        // Fetch all teams
        const teamsResponse = await fetch('http://localhost:3001/api/teams');
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          const teamsWithIcons = teamsData.map((team: any) => {
            const iconData = teamIcons.find(t => t.path === team.path);
            return {
              ...team,
              icon: iconData?.icon || Code
            };
          });
          setTeams(teamsWithIcons);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamName]);

  const toggleMeetingExpansion = (meetingId: string) => {
    setExpandedMeetings(prev => 
      prev.includes(meetingId) 
        ? prev.filter(id => id !== meetingId)
        : [...prev, meetingId]
    );
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.summary.some(s => s.speaker.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCurrentTeamIcon = () => {
    const team = teamIcons.find(t => t.path === teamName);
    return team?.icon || Code;
  };

  const CurrentTeamIcon = getCurrentTeamIcon();

  const todaysMeeting = filteredMeetings.find(m => m.isToday);
  const previousMeetings = filteredMeetings.filter(m => !m.isToday);

  const viewDetailedSummary = (meeting: StandupMeeting) => {
    navigate(`/summary/${meeting.id}`, { state: { standupData: meeting } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading team history...</p>
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

      <div className="flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto px-6 py-8">
          {/* Team Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <CurrentTeamIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{formattedTeamName} Team</h1>
                <p className="text-slate-600">Standup meeting history</p>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white px-4 py-2">
              {filteredMeetings.length} meetings
            </Badge>
          </div>

          {/* Today's Scrum - Featured */}
          {todaysMeeting && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Today's Scrum</h2>
              <Card className="border-blue-200 bg-blue-50 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-blue-900">{todaysMeeting.date}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-600 text-white">Latest</Badge>
                      <Button 
                        onClick={() => viewDetailedSummary(todaysMeeting)}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {todaysMeeting.summary.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {item.initial}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{item.speaker}</h4>
                            <p className="text-sm text-slate-500">{item.time}</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-600" />
                              <span className="text-xs font-medium text-slate-700">Yesterday</span>
                            </div>
                            <p className="text-sm text-slate-700">{item.yesterday}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <ArrowRight className="w-3 h-3 text-blue-600" />
                              <span className="text-xs font-medium text-slate-700">Today</span>
                            </div>
                            <p className="text-sm text-slate-700">{item.today}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span className="text-xs font-medium text-slate-700">Blockers</span>
                            </div>
                            <p className={`text-sm ${item.blockers.includes("No blockers") ? "text-green-700" : "text-red-700"}`}>
                              {item.blockers}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Previous Scrums */}
          {previousMeetings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Previous Scrums</h2>
              <div className="space-y-4">
                {previousMeetings.map((meeting) => (
                  <Collapsible 
                    key={meeting.id}
                    open={expandedMeetings.includes(meeting.id)}
                    onOpenChange={() => toggleMeetingExpansion(meeting.id)}
                  >
                    <Card className="border-slate-200 hover:border-blue-300 transition-colors">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-slate-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              <CardTitle className="text-lg text-slate-900">{meeting.date}</CardTitle>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewDetailedSummary(meeting);
                                }}
                                variant="outline"
                                size="sm"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              {expandedMeetings.includes(meeting.id) ? (
                                <ChevronUp className="w-5 h-5 text-slate-500" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-500" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
                          <div className="space-y-4">
                            {meeting.summary.map((item, index) => (
                              <div key={index} className="border-l-4 border-blue-200 pl-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                    {item.initial}
                                  </div>
                                  <span className="font-medium text-slate-900">{item.speaker}</span>
                                  <span className="text-sm text-slate-500">({item.time})</span>
                                </div>
                                <p className="text-sm text-slate-700">{item.yesterday}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            </div>
          )}

          {filteredMeetings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No meetings found for this team.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-blue-100 border-l border-blue-200 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">My Teams</h3>
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-3">
              {teams.map((team) => {
                const TeamIcon = team.icon;
                const isActive = team.path === teamName;
                return (
                  <Button
                    key={team.name}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-blue-600 text-white" 
                        : "text-slate-700 hover:bg-white/50"
                    }`}
                    onClick={() => navigate(`/team/${team.path}`)}
                  >
                    <TeamIcon className="w-4 h-4 mr-3" />
                    {team.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-slate-500">
            Powered by IBM watsonx.ai & OpenAI Whisper
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TeamHistory;
