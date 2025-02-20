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
      // Update times_requested and renew expiration
      await db.update(transcripts)
        .set({
          timesRequested: (existingTranscript[0].timesRequested ?? 0) + 1,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        .where(eq(transcripts.id, existingTranscript[0].id));

      return NextResponse.json({
        exists: true,
        transcript: existingTranscript[0]
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
