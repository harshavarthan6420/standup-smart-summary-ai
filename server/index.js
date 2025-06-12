
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const port = 3001;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for standup data
let standupData = {
  development: [
    {
      id: 'dev-20250612',
      date: '12/06/2025',
      isToday: true,
      team: 'Development',
      summary: [
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
      ]
    },
    {
      id: 'dev-20250611',
      date: '11/06/2025',
      team: 'Development',
      summary: [
        {
          speaker: "Alice Johnson",
          initial: "A",
          time: "09:00-09:03",
          yesterday: "Worked on API documentation and code reviews.",
          today: "Starting user authentication module implementation.",
          blockers: "None",
          rawContent: "Yesterday API docs and reviews. Today starting auth module."
        }
      ]
    }
  ],
  'qa-automation': [
    {
      id: 'qa-20250612',
      date: '12/06/2025',
      isToday: true,
      team: 'QA Automation',
      summary: [
        {
          speaker: "David Wilson",
          initial: "D",
          time: "09:00-09:03",
          yesterday: "Completed automated test suite for the new API endpoints.",
          today: "Will work on integration testing for the mobile app.",
          blockers: "Waiting for test environment setup.",
          rawContent: "Yesterday completed API test automation. Today mobile integration tests. Blocked on test env."
        }
      ]
    }
  ],
  'ui': [
    {
      id: 'ui-20250612',
      date: '12/06/2025',
      isToday: true,
      team: 'UI',
      summary: [
        {
          speaker: "Emma Davis",
          initial: "E",
          time: "09:00-09:03",
          yesterday: "Finalized designs for the new dashboard components.",
          today: "Starting implementation of responsive layouts.",
          blockers: "No blockers.",
          rawContent: "Yesterday finished dashboard designs. Today responsive layouts. No blockers."
        }
      ]
    }
  ],
  'devops': [
    {
      id: 'devops-20250612',
      date: '12/06/2025',
      isToday: true,
      team: 'DevOps',
      summary: [
        {
          speaker: "Frank Miller",
          initial: "F",
          time: "09:00-09:03",
          yesterday: "Optimized CI/CD pipeline and reduced build times by 30%.",
          today: "Will work on container orchestration improvements.",
          blockers: "None at the moment.",
          rawContent: "Yesterday optimized pipelines, 30% faster builds. Today container orchestration. No blockers."
        }
      ]
    }
  ]
};

// Get all teams
app.get('/api/teams', (req, res) => {
  const teams = Object.keys(standupData).map(teamKey => ({
    name: teamKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    path: teamKey,
    meetingCount: standupData[teamKey].length
  }));
  res.json(teams);
});

// Get team history
app.get('/api/teams/:teamName/history', (req, res) => {
  const { teamName } = req.params;
  const teamData = standupData[teamName] || [];
  res.json(teamData);
});

// Get specific standup details
app.get('/api/standups/:standupId', (req, res) => {
  const { standupId } = req.params;
  
  // Find standup across all teams
  for (const teamKey of Object.keys(standupData)) {
    const standup = standupData[teamKey].find(s => s.id === standupId);
    if (standup) {
      return res.json(standup);
    }
  }
  
  res.status(404).json({ error: 'Standup not found' });
});

// Process new standup (placeholder for future AI integration)
app.post('/api/process-standup', upload.single('audio'), (req, res) => {
  const { team, transcript } = req.body;
  
  // Simulate processing time
  setTimeout(() => {
    const newStandupId = `${team}-${Date.now()}`;
    const newStandup = {
      id: newStandupId,
      date: new Date().toLocaleDateString('en-GB'),
      team: team.charAt(0).toUpperCase() + team.slice(1),
      summary: [
        {
          speaker: "Sample Speaker",
          initial: "S",
          time: "09:00-09:03",
          yesterday: "Sample yesterday update",
          today: "Sample today plan",
          blockers: "No blockers",
          rawContent: transcript || "Sample transcript content"
        }
      ]
    };
    
    if (!standupData[team]) {
      standupData[team] = [];
    }
    
    standupData[team].unshift(newStandup);
    res.json(newStandup);
  }, 2000);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
