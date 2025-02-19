import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transcripts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Get transcript record from database
    const [record] = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.id, id));

    if (!record) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // Check if transcript has expired
    if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Transcript has expired' },
        { status: 410 }  // 410 Gone
      );
    }

    // Increment times requested
    await db
      .update(transcripts)
      .set({
        timesRequested: (record.timesRequested ?? 0) + 1
      })
      .where(eq(transcripts.id, id));

    // Fetch transcript content
    const transcriptResponse = await fetch(record.transcriptUrl);
    const transcript = await transcriptResponse.json();

    return NextResponse.json({
      id: record.id,
      audioUrl: record.audioUrl,
      transcriptUrl: record.transcriptUrl,
      transcript,
      uploadedAt: record.uploadedAt,
      expiresAt: record.expiresAt,
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
