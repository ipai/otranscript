import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transcripts } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// Keep track of recent increments to prevent duplicates
const recentIncrements = new Map<string, number>();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds

export async function POST(request: Request) {
  console.log('Increment endpoint called');
  const { id } = await request.json();
  console.log('Incrementing transcript:', id);

  if (!id) {
    return NextResponse.json({ error: 'No transcript ID provided' }, { status: 400 });
  }

  // Check if this transcript was recently incremented
  const lastIncrement = recentIncrements.get(id);
  const now = Date.now();
  if (lastIncrement && now - lastIncrement < RATE_LIMIT_WINDOW) {
    console.log('Skipping duplicate increment within rate limit window');
    return NextResponse.json({ success: true, skipped: true });
  }

  // Update last increment time
  recentIncrements.set(id, now);

  // Clean up old entries
  for (const [key, time] of recentIncrements.entries()) {
    if (now - time > RATE_LIMIT_WINDOW) {
      recentIncrements.delete(key);
    }
  }

  try {
    await db.update(transcripts)
      .set({
        timesRequested: sql`COALESCE(${transcripts.timesRequested}, 0) + 1`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })
      .where(eq(transcripts.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing transcript usage:', error);
    return NextResponse.json(
      { error: 'Failed to increment transcript usage' },
      { status: 500 }
    );
  }
}
