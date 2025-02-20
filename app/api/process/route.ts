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

// Configure route options using new App Router syntax
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Configure body parser for large files
export async function POST(request: NextRequest) {
  const { audioUrl, hash } = await request.json();

  if (!audioUrl) {
    return NextResponse.json(
      { error: 'No audio URL provided' },
      { status: 400 }
    );
  }

  return processUpload(audioUrl, hash);
}

async function processUpload(audioUrl: string, providedHash?: string) {
  // Verify environment configuration
  if (!process.env.DEEPGRAM_API_KEY || !process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'Missing required environment configuration' },
      { status: 500 }
    );
  }

  try {
    // Fetch the audio file from the URL
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch audio file');
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use provided hash or calculate new one
    const hash = providedHash || (() => {
      const uint8Array = new Uint8Array(buffer);
      return createHash('sha256').update(uint8Array).digest('hex');
    })();

    // Check if file already exists
    const existingTranscript = await db.select()
      .from(transcripts)
      .where(eq(transcripts.audioSha256, hash))
      .limit(1);

    if (existingTranscript.length > 0) {
      // Just return the existing transcript, don't increment counter
      return NextResponse.json({
        id: existingTranscript[0].id,
        message: 'File already processed'
      });
    }

    // Generate transcript using Deepgram
    const transcription = await transcribeAudio(buffer, process.env.DEEPGRAM_API_KEY);
    
    // Store transcript in blob storage
    const transcriptBlob = await put(`${hash}.json`, JSON.stringify(transcription), {
      access: 'public',
      contentType: 'application/json',
    });

    // Store mapping in database
    const [record] = await db.insert(transcripts).values({
      audioUrl: audioUrl,
      transcriptUrl: transcriptBlob.url,
      audioSha256: hash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    }).returning();

    // Increment times_requested for the new record
    await db.update(transcripts)
      .set({
        timesRequested: 1
      })
      .where(eq(transcripts.id, record.id));

    return NextResponse.json({
      id: record.id,
      audioUrl,
      transcriptUrl: transcriptBlob.url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process audio file' },
      { status: 500 }
    );
  }
}
