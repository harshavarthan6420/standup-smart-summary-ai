
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
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
    }
  ],
  'qa-automation': [],
  'ui': [],
  'devops': []
};

// Simulated open source transcription function
async function transcribeAudio(audioBuffer, filename) {
  try {
    console.log('Starting audio transcription with open source model...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock transcription result that would come from Whisper.cpp or similar
    const mockTranscription = {
      text: "Yesterday I worked on fixing the authentication bug and completed the user profile updates. Today I'm going to work on the new dashboard feature and help with code reviews. I don't have any blockers right now. Speaker B: I finished the database migrations yesterday and deployed to staging. Today I'll be working on the frontend components. I'm blocked waiting for admin access to the production environment.",
      segments: [
        {
          start: 0.0,
          end: 15.5,
          text: "Yesterday I worked on fixing the authentication bug and completed the user profile updates. Today I'm going to work on the new dashboard feature and help with code reviews. I don't have any blockers right now."
        },
        {
          start: 15.5,
          end: 30.0,
          text: "Speaker B: I finished the database migrations yesterday and deployed to staging. Today I'll be working on the frontend components. I'm blocked waiting for admin access to the production environment."
        }
      ]
    };
    
    console.log('Transcription completed');
    return mockTranscription;
  } catch (error) {
    console.error('Error in transcription:', error);
    throw error;
  }
}

// Simulated speaker diarization function
async function segmentBySpeaker(transcriptionData) {
  try {
    console.log('Starting speaker segmentation...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const segments = transcriptionData.segments || [];
    const fullText = transcriptionData.text;
    
    // Mock speaker segmentation that would come from pyannote or similar
    const segmentedData = [
      {
        speaker: "Speaker A",
        start_time: "00:00:00",
        end_time: "00:00:15",
        text: "Yesterday I worked on fixing the authentication bug and completed the user profile updates. Today I'm going to work on the new dashboard feature and help with code reviews. I don't have any blockers right now."
      },
      {
        speaker: "Speaker B",
        start_time: "00:00:15",
        end_time: "00:00:30",
        text: "I finished the database migrations yesterday and deployed to staging. Today I'll be working on the frontend components. I'm blocked waiting for admin access to the production environment."
      }
    ];
    
    console.log('Speaker segmentation completed');
    return segmentedData;
  } catch (error) {
    console.error('Error in speaker segmentation:', error);
    throw error;
  }
}

// Simulated content classification function
async function classifyStandupContent(segmentedData) {
  try {
    console.log('Starting content classification...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const summaries = [];
    
    for (const segment of segmentedData) {
      // Mock classification that would come from a local LLM or BERT model
      let classification;
      
      if (segment.speaker === "Speaker A") {
        classification = {
          yesterday: "Fixed authentication bug and completed user profile updates",
          today: "Work on new dashboard feature and help with code reviews",
          blockers: "None"
        };
      } else {
        classification = {
          yesterday: "Finished database migrations and deployed to staging",
          today: "Develop frontend components",
          blockers: "Waiting for admin access to production environment"
        };
      }
      
      summaries.push({
        speaker: segment.speaker,
        initial: segment.speaker.charAt(segment.speaker.length - 1),
        time: `${segment.start_time}-${segment.end_time}`,
        yesterday: classification.yesterday,
        today: classification.today,
        blockers: classification.blockers,
        rawContent: segment.text
      });
    }
    
    console.log('Content classification completed');
    return summaries;
  } catch (error) {
    console.error('Error in content classification:', error);
    throw error;
  }
}

// Function to process transcript text directly
async function processTranscriptText(transcriptText) {
  try {
    console.log('Processing transcript text...');
    
    // Simulate speaker segmentation for text input
    const mockSegments = [
      {
        speaker: "Speaker A",
        start_time: "00:00:00",
        end_time: "00:02:00",
        text: transcriptText.substring(0, Math.floor(transcriptText.length / 2))
      },
      {
        speaker: "Speaker B", 
        start_time: "00:02:00",
        end_time: "00:04:00",
        text: transcriptText.substring(Math.floor(transcriptText.length / 2))
      }
    ];
    
    const summaries = await classifyStandupContent(mockSegments);
    return summaries;
  } catch (error) {
    console.error('Error processing transcript text:', error);
    throw error;
  }
}

// Get all teams
app.get('/api/teams', (req, res) => {
  try {
    const teams = Object.keys(standupData).map(teamKey => ({
      name: teamKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      path: teamKey,
      meetingCount: standupData[teamKey].length
    }));
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get team history
app.get('/api/teams/:teamName/history', (req, res) => {
  try {
    const { teamName } = req.params;
    const teamData = standupData[teamName] || [];
    res.json(teamData);
  } catch (error) {
    console.error('Error fetching team history:', error);
    res.status(500).json({ error: 'Failed to fetch team history' });
  }
});

// Get specific standup details
app.get('/api/standups/:standupId', (req, res) => {
  try {
    const { standupId } = req.params;
    
    // Find standup across all teams
    for (const teamKey of Object.keys(standupData)) {
      const standup = standupData[teamKey].find(s => s.id === standupId);
      if (standup) {
        return res.json(standup);
      }
    }
    
    res.status(404).json({ error: 'Standup not found' });
  } catch (error) {
    console.error('Error fetching standup:', error);
    res.status(500).json({ error: 'Failed to fetch standup details' });
  }
});

// Process new standup with open source AI processing
app.post('/api/process-standup', upload.single('audio'), async (req, res) => {
  try {
    const { team, transcript } = req.body;
    const audioFile = req.file;
    
    console.log(`Processing standup for team: ${team}`);
    
    if (!team) {
      return res.status(400).json({ error: 'Team selection is required' });
    }
    
    let summaries = [];
    
    if (audioFile) {
      // Process audio file
      console.log('Processing audio file...');
      const transcriptionData = await transcribeAudio(audioFile.buffer, audioFile.originalname);
      const segmentedData = await segmentBySpeaker(transcriptionData);
      summaries = await classifyStandupContent(segmentedData);
    } else if (transcript) {
      // Process text transcript
      console.log('Processing text transcript...');
      summaries = await processTranscriptText(transcript);
    } else {
      return res.status(400).json({ error: 'No audio file or transcript provided' });
    }
    
    // Create new standup entry
    const newStandupId = `${team}-${Date.now()}`;
    const newStandup = {
      id: newStandupId,
      date: new Date().toLocaleDateString('en-GB'),
      team: team.charAt(0).toUpperCase() + team.slice(1),
      summary: summaries
    };
    
    // Store in memory
    if (!standupData[team]) {
      standupData[team] = [];
    }
    
    standupData[team].unshift(newStandup);
    
    console.log('Standup processing completed successfully');
    res.json(newStandup);
    
  } catch (error) {
    console.error('Error processing standup:', error);
    res.status(500).json({ 
      error: 'Failed to process standup', 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Using open source models for processing');
});
