
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
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

// Ollama API configuration
const OLLAMA_BASE_URL = 'http://localhost:11434';

// Function to call Ollama API
async function callOllama(model, prompt, system = null) {
  try {
    const payload = {
      model: model,
      prompt: prompt,
      stream: false
    };
    
    if (system) {
      payload.system = system;
    }

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, payload);
    return response.data.response;
  } catch (error) {
    console.error('Error calling Ollama:', error.message);
    throw new Error(`Ollama API error: ${error.message}`);
  }
}

// Function to transcribe audio using Whisper (would require whisper.cpp or similar)
async function transcribeAudio(audioBuffer, filename) {
  try {
    console.log('Starting audio transcription...');
    
    // For now, we'll use a mock response since implementing whisper.cpp requires additional setup
    // In a real implementation, you would:
    // 1. Save the audio buffer to a temporary file
    // 2. Call whisper.cpp binary or use a Node.js whisper binding
    // 3. Parse the output for timestamps and text
    
    // Mock transcription with realistic structure
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
          text: "I finished the database migrations yesterday and deployed to staging. Today I'll be working on the frontend components. I'm blocked waiting for admin access to the production environment."
        }
      ]
    };
    
    console.log('Audio transcription completed');
    return mockTranscription;
  } catch (error) {
    console.error('Error in transcription:', error);
    throw error;
  }
}

// Function to segment by speaker using Ollama
async function segmentBySpeaker(transcriptionData) {
  try {
    console.log('Starting speaker segmentation with Ollama...');
    
    const fullText = transcriptionData.text;
    
    const systemPrompt = `You are an expert at speaker diarization. Your task is to identify different speakers in a transcript and segment the text by speaker. Return a JSON array where each object has: speaker (like "Speaker A", "Speaker B"), start_time, end_time, and text.`;
    
    const prompt = `Please segment this transcript by speaker and return as JSON:

"${fullText}"

Return only valid JSON array format with no additional text.`;

    const response = await callOllama('llama3.2', prompt, systemPrompt);
    
    try {
      // Try to parse the JSON response
      const segmentedData = JSON.parse(response);
      console.log('Speaker segmentation completed');
      return segmentedData;
    } catch (parseError) {
      console.log('JSON parsing failed, using fallback segmentation');
      // Fallback to simple segmentation
      const segments = fullText.split(/(?:Speaker [A-Z]:|[.!?]\s+)/).filter(text => text.trim());
      return segments.map((text, index) => ({
        speaker: `Speaker ${String.fromCharCode(65 + index)}`,
        start_time: `00:0${index}:00`,
        end_time: `00:0${index + 1}:00`,
        text: text.trim()
      }));
    }
  } catch (error) {
    console.error('Error in speaker segmentation:', error);
    // Fallback segmentation
    const segments = transcriptionData.text.split('.').filter(text => text.trim());
    return segments.map((text, index) => ({
      speaker: `Speaker ${String.fromCharCode(65 + index)}`,
      start_time: `00:0${index}:00`,
      end_time: `00:0${index + 1}:00`,
      text: text.trim()
    }));
  }
}

// Function to classify standup content using Ollama
async function classifyStandupContent(segmentedData) {
  try {
    console.log('Starting content classification with Ollama...');
    
    const summaries = [];
    
    for (const segment of segmentedData) {
      const systemPrompt = `You are an expert at analyzing standup meeting content. Extract and categorize what team members said into three categories: Yesterday (what they did), Today (what they're working on), and Blockers (what's blocking them or "None" if no blockers).`;
      
      const prompt = `Analyze this standup speech and extract Yesterday, Today, and Blockers. Return as JSON with keys: yesterday, today, blockers.

Text: "${segment.text}"

Return only valid JSON with no additional text.`;

      try {
        const response = await callOllama('llama3.2', prompt, systemPrompt);
        const classification = JSON.parse(response);
        
        summaries.push({
          speaker: segment.speaker,
          initial: segment.speaker.charAt(segment.speaker.length - 1),
          time: `${segment.start_time}-${segment.end_time}`,
          yesterday: classification.yesterday || "No updates",
          today: classification.today || "No plans mentioned",
          blockers: classification.blockers || "None",
          rawContent: segment.text
        });
      } catch (parseError) {
        console.log(`Classification failed for ${segment.speaker}, using fallback`);
        // Fallback classification
        const text = segment.text.toLowerCase();
        let yesterday = "No updates";
        let today = "No plans mentioned";
        let blockers = "None";
        
        if (text.includes('yesterday') || text.includes('last')) {
          yesterday = "Worked on project tasks";
        }
        if (text.includes('today') || text.includes('working')) {
          today = "Continuing current work";
        }
        if (text.includes('block') || text.includes('stuck') || text.includes('waiting')) {
          blockers = "Has some blockers";
        }
        
        summaries.push({
          speaker: segment.speaker,
          initial: segment.speaker.charAt(segment.speaker.length - 1),
          time: `${segment.start_time}-${segment.end_time}`,
          yesterday,
          today,
          blockers,
          rawContent: segment.text
        });
      }
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
    
    // Clean up RTF formatting if present
    const cleanText = transcriptText
      .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF control words
      .replace(/[{}]/g, '') // Remove braces
      .replace(/\\\\/g, '') // Remove backslashes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Create mock transcription data
    const transcriptionData = {
      text: cleanText,
      segments: []
    };
    
    const segmentedData = await segmentBySpeaker(transcriptionData);
    const summaries = await classifyStandupContent(segmentedData);
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

// Health check for Ollama
app.get('/api/health/ollama', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    res.json({ status: 'OK', message: 'Ollama is running', models: response.data.models });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Ollama is not running or not accessible' });
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
  console.log('Using Ollama for open source AI processing');
  console.log('Make sure Ollama is running on http://localhost:11434');
});
