import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { transcribeAudio } from '@/lib/transcribe';
import { db } from '@/lib/db';
import { transcripts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';
import { Buffer } from 'buffer';

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

    // Calculate SHA256 hash and prepare buffer for transcription
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = createHash('sha256').update(new Uint8Array(arrayBuffer)).digest('hex');

    // Check if file already exists
    const existingTranscript = await db.select()
      .from(transcripts)
      .where(eq(transcripts.audioSha256, hash))
      .limit(1);

    if (existingTranscript.length > 0) {
      // Increment times_requested for existing transcript
      await db.update(transcripts)
        .set({
          timesRequested: (existingTranscript[0].timesRequested ?? 0) + 1
        })
        .where(eq(transcripts.id, existingTranscript[0].id));

      return NextResponse.json({
        id: existingTranscript[0].id,
        message: 'File already processed'
      });
    }

    // Upload audio file to blob storage
    const audioBlob = await put(file.name, file, {
      access: 'public',
    });

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
      audioSha256: hash,
      timesRequested: 1,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
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
