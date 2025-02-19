import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') });
import { transcribeAudio } from '../lib/transcribe';

async function saveTranscription(audioFilePath: string) {
  try {
    // Read the audio file
    const audioBuffer = fs.readFileSync(audioFilePath);
    
    // Get the API key from environment
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY not found in environment');
    }

    console.log('Transcribing audio file...');
    const transcription = await transcribeAudio(audioBuffer, apiKey);

    // Create output filename based on input filename
    const baseFileName = path.basename(audioFilePath, path.extname(audioFilePath));
    const outputPath = path.join(__dirname, '..', 'data', `${baseFileName}_transcription.json`);

    // Ensure data directory exists
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save transcription to file
    fs.writeFileSync(outputPath, JSON.stringify(transcription, null, 2));
    console.log(`Transcription saved to: ${outputPath}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get file path from command line argument
const audioFilePath = process.argv[2];
if (!audioFilePath) {
  console.error('Please provide the path to the audio file');
  process.exit(1);
}

saveTranscription(audioFilePath);
