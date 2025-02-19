import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/transcribe';

export async function POST(request: NextRequest) {
  try {
    const { audioUrl } = await request.json();

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'No audio URL provided' },
        { status: 400 }
      );
    }

    // Download the audio file from the Blob store
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Audio file size:', buffer.byteLength, 'bytes');

    // Transcribe the audio using our shared module
    const transcription = await transcribeAudio(buffer, process.env.DEEPGRAM_API_KEY!);
    
    return NextResponse.json(transcription);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
