import { db } from './';
import { transcripts } from './schema';
import { eq } from 'drizzle-orm';

export type Transcript = typeof transcripts.$inferSelect;
export type NewTranscript = typeof transcripts.$inferInsert;

export async function createTranscript(audioUrl: string, transcriptUrl: string): Promise<Transcript> {
  const [transcript] = await db.insert(transcripts)
    .values({
      audioUrl,
      transcriptUrl,
    })
    .returning();
  
  return transcript;
}

export async function getTranscript(id: string): Promise<Transcript | null> {
  const [transcript] = await db
    .select()
    .from(transcripts)
    .where(eq(transcripts.id, id))
    .limit(1);
  
  return transcript || null;
}
