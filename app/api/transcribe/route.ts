import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/transcribe';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer and then to Buffer
    const arrayBuffer = await file.arrayBuffer();
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
