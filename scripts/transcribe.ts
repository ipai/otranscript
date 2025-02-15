import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { transcribeAudio } from '../lib/transcribe';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function transcribeFile(filePath: string) {
  try {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    if (!process.env.DEEPGRAM_API_KEY) {
      console.error('DEEPGRAM_API_KEY not found in .env.local');
      process.exit(1);
    }

    console.log(`Transcribing file: ${filePath}`);
    
    // Read file and transcribe
    const audioFile = fs.readFileSync(filePath);
    const transcription = await transcribeAudio(audioFile, process.env.DEEPGRAM_API_KEY);

    // Create output filename
    const outputPath = path.join(
      path.dirname(filePath),
      `${path.basename(filePath, path.extname(filePath))}_transcription.json`
    );

    // Save transcription to file
    fs.writeFileSync(outputPath, JSON.stringify(transcription, null, 2));
    console.log(`Transcription saved to: ${outputPath}`);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Get file path from command line argument
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a file path');
  console.error('Usage: npm run transcribe <file_path>');
  process.exit(1);
}

transcribeFile(filePath);
