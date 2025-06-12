
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

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

// Function 1: Audio to Text Transcript using OpenAI Whisper
async function transcribeAudio(audioBuffer, filename) {
  try {
    console.log('Starting audio transcription...');
    
    // Create a temporary file for the audio
    const tempPath = path.join(__dirname, 'temp_' + filename);
    fs.writeFileSync(tempPath, audioBuffer);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"]
    });
    
    // Clean up temp file
    fs.unlinkSync(tempPath);
    
    console.log('Transcription completed');
    return transcription;
  } catch (error) {
    console.error('Error in transcription:', error);
    throw error;
  }
}

// Function 2: Speaker Diarization (simplified - using AI to identify speakers)
async function segmentBySpeaker(transcriptionData) {
  try {
    console.log('Starting speaker segmentation...');
    
    const segments = transcriptionData.segments || [];
    const fullText = transcriptionData.text;
    
    // Use GPT to identify and segment speakers
    const prompt = `
    Please analyze this standup meeting transcript and identify different speakers. 
    Segment the text by speaker and assign speaker names (like Speaker A, Speaker B, etc.).
    Return a JSON array with segments containing: speaker, start_time, end_time, text.
    
    Transcript: ${fullText}
    
    Segments with timestamps:
    ${segments.map(seg => `${seg.start}s-${seg.end}s: ${seg.text}`).join('\n')}
    
    Please return only valid JSON in this format:
    [{"speaker": "Speaker A", "start_time": "00:00:00", "end_time": "00:00:30", "text": "speaker content"}]
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1
    });
    
    const segmentedData = JSON.parse(response.choices[0].message.content);
    console.log('Speaker segmentation completed');
    return segmentedData;
  } catch (error) {
    console.error('Error in speaker segmentation:', error);
    throw error;
  }
}

// Function 3: Classify and Summarize Standup Content
async function classifyStandupContent(segmentedData) {
  try {
    console.log('Starting content classification...');
    
    const summaries = [];
    
    for (const segment of segmentedData) {
      const prompt = `
      Analyze this standup update and extract:
      1. Yesterday: What work was completed since last standup
      2. Today: What work is planned for today
      3. Blockers: Any impediments or issues (use "None" if no blockers)
      
      Provide brief, clear summaries for each category.
      
      Speaker content: "${segment.text}"
      
      Return only valid JSON in this format:
      {
        "yesterday": "summary of yesterday's work",
        "today": "summary of today's plans", 
        "blockers": "blockers or None"
      }
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      });
      
      const classification = JSON.parse(response.choices[0].message.content);
      
      summaries.push({
        speaker: segment.speaker,
        initial: segment.speaker.charAt(segment.speaker.length - 1), // Last char as initial
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

// Process new standup with actual AI processing
app.post('/api/process-standup', upload.single('audio'), async (req, res) => {
  try {
    const { team, transcript } = req.body;
    const audioFile = req.file;
    
    console.log(`Processing standup for team: ${team}`);
    
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Make sure to set OPENAI_API_KEY environment variable for full functionality');
});
