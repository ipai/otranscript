import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { transcribeAudio } from '@/lib/transcribe';
import { db } from '@/lib/db';
import { transcripts } from '@/lib/db/schema';

/**
 * Process audio file upload and generate transcript.
 * 
 * Workflow:
 * 1. Upload audio file to blob storage
 * 2. Generate transcript using Deepgram API
 * 3. Store transcript data in database
 * 
 * @param request NextRequest containing audio file in FormData
 * @returns Transcript ID for accessing the processed content
 */
export async function POST(request: NextRequest) {
  // Verify environment configuration
  if (!process.env.DEEPGRAM_API_KEY || !process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'Missing required environment configuration' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload audio file to blob storage
    const audioBlob = await put(file.name, file, {
      access: 'public',
    });

    // Convert file to buffer for transcription
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate transcript using Deepgram
    const transcription = await transcribeAudio(buffer, process.env.DEEPGRAM_API_KEY);
    
    // Store transcript in blob storage
    const transcriptBlob = await put(`${file.name}.json`, JSON.stringify(transcription), {
      access: 'public',
      contentType: 'application/json',
    });

    // Store mapping in database
    const [record] = await db.insert(transcripts).values({
      audioUrl: audioBlob.url,
      transcriptUrl: transcriptBlob.url,
    }).returning();

    return NextResponse.json({
      id: record.id,
      audioUrl: audioBlob.url,
      transcriptUrl: transcriptBlob.url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process audio file' },
      { status: 500 }
    );
  }
}
