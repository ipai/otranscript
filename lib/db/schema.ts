import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const transcripts = pgTable('transcripts', {
  id: uuid('id').primaryKey().defaultRandom(),
  audioUrl: text('audio_url').notNull(),
  transcriptUrl: text('transcript_url').notNull(),
  audioSha256: text('audio_sha256'),
  timesRequested: integer('times_requested').default(0),
  expiresAt: timestamp('expires_at'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});
