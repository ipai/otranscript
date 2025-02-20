import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transcripts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const { hash } = await request.json();

  if (!hash) {
    return NextResponse.json({ error: 'No hash provided' }, { status: 400 });
  }

  try {
    const existingTranscript = await db.select()
      .from(transcripts)
      .where(eq(transcripts.audioSha256, hash))
      .limit(1);

    if (existingTranscript.length > 0) {
      // Only return that the transcript exists, don't increment counter yet
      return NextResponse.json({
        exists: true,
        transcript: existingTranscript[0],
        shouldIncrement: true // Flag to indicate we should increment later
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('Error checking hash:', error);
    return NextResponse.json(
      { error: 'Failed to check hash' },
      { status: 500 }
    );
  }
}
