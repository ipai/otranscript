import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transcripts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Demo transcript details
const DEMO_TRANSCRIPT = {
  id: 'demo',
  audioUrl: 'https://q71bq0dqsduvn5yy.public.blob.vercel-storage.com/19720124_atc_03-XcN5Rnjm2u9j9NkPoRmfoJqaq85ZEm.mp3',
  transcriptUrl: 'https://q71bq0dqsduvn5yy.public.blob.vercel-storage.com/19720124_atc_03.mp3-xXETalhFBj4QPGfV4HkXEj9oyDzxHQ.json',
  uploadedAt: new Date('2025-02-19T00:00:00.000Z'),
  expiresAt: null,
  timesRequested: 0
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Handle demo transcript request
    if (id === 'demo') {
      // Fetch demo transcript content
      const transcriptResponse = await fetch(DEMO_TRANSCRIPT.transcriptUrl);
      const transcript = await transcriptResponse.json();

      return NextResponse.json({
        ...DEMO_TRANSCRIPT,
        transcript
      });
    }

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
