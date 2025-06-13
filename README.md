
# IBM Standup Summarizer

## Project info

**URL**: https://lovable.dev/projects/7b002a11-5835-4ab6-ab69-a43d7559f2d0

## Overview

This application automates daily standup meeting summaries using open source AI models. It processes audio recordings or text transcripts to extract Yesterday/Today/Blockers for each speaker.

## Features

- **Audio Processing**: Upload meeting recordings for automatic transcription
- **Text Processing**: Upload or paste meeting transcripts
- **Speaker Identification**: Automatically segments conversations by speaker
- **Content Classification**: Extracts Yesterday, Today, and Blockers using AI
- **Team Management**: Organize standups by different teams
- **Meeting History**: View past standup summaries

## Technology Stack

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Open Source AI Models via Ollama

## Setup Instructions

### Prerequisites

1. **Node.js & npm** - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
2. **Ollama** - Required for AI processing

### Ollama Setup

1. **Install Ollama**
   ```bash
   # On macOS
   brew install ollama
   
   # On Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # On Windows
   # Download from https://ollama.ai/download
   ```

2. **Start Ollama Service**
   ```bash
   ollama serve
   ```

3. **Pull Required Models**
   ```bash
   # Pull the Llama 3.2 model (recommended for text processing)
   ollama pull llama3.2
   
   # Optional: Pull other models for different use cases
   ollama pull llama3.2:3b    # Smaller, faster model
   ollama pull codellama      # For code-related content
   ```

4. **Verify Ollama is Running**
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Application Setup

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Start the Backend Server**
   ```bash
   cd server
   npm start
   ```
   The backend will run on `http://localhost:3001`

5. **Start the Frontend Development Server**
   ```bash
   # In the root directory
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Audio Processing Setup (Optional)

For actual audio transcription, you'll need to set up Whisper:

1. **Install whisper.cpp**
   ```bash
   git clone https://github.com/ggerganov/whisper.cpp.git
   cd whisper.cpp
   make
   
   # Download a model
   bash ./models/download-ggml-model.sh base.en
   ```

2. **Update the backend** to call whisper.cpp binary in the `transcribeAudio` function

## Usage

1. **Select Team**: Choose which team the standup belongs to
2. **Upload Content**: Either:
   - Drag & drop an audio file (.wav, .mp3, .m4a, .aac, .flac)
   - Drag & drop a transcript file (.txt, .md)
   - Paste transcript text directly
3. **Processing**: The system will:
   - Transcribe audio (if applicable)
   - Identify speakers
   - Extract Yesterday/Today/Blockers for each speaker
4. **View Results**: See the structured summary with speaker details
5. **Browse History**: View past standup summaries by team

## API Endpoints

- `GET /api/teams` - Get all teams
- `GET /api/teams/:teamName/history` - Get team standup history
- `GET /api/standups/:standupId` - Get specific standup details
- `POST /api/process-standup` - Process new standup (audio or transcript)
- `GET /api/health` - Server health check
- `GET /api/health/ollama` - Ollama service health check

## Troubleshooting

### Ollama Issues
- Ensure Ollama is running: `ollama serve`
- Check if models are downloaded: `ollama list`
- Verify API access: `curl http://localhost:11434/api/tags`

### Backend Issues
- Check if backend is running on port 3001
- Verify CORS settings allow frontend origin
- Check console logs for detailed error messages

### Frontend Issues
- Ensure frontend can reach backend at `http://localhost:3001`
- Check browser developer tools for network errors
- Verify drag & drop file types are supported

## Development

### Adding New Models

To use different Ollama models, update the model name in `server/index.js`:

```javascript
const response = await callOllama('your-model-name', prompt, systemPrompt);
```

### Customizing Processing

The AI processing pipeline consists of:
1. **Audio Transcription** (`transcribeAudio`)
2. **Speaker Segmentation** (`segmentBySpeaker`)
3. **Content Classification** (`classifyStandupContent`)

Each function can be customized for your specific needs.

## Deployment

### Frontend Deployment
Simply open [Lovable](https://lovable.dev/projects/7b002a11-5835-4ab6-ab69-a43d7559f2d0) and click on Share → Publish.

### Backend Deployment
Deploy the `server` directory to your preferred hosting service. Ensure Ollama is available in the deployment environment.

## Custom Domain

Yes, you can connect a custom domain! Navigate to Project > Settings > Domains in Lovable and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is built with open source technologies and uses open source AI models for processing.
