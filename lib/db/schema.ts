import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const transcripts = pgTable('transcripts', {
  id: uuid('id').primaryKey().defaultRandom(),
  audioUrl: text('audio_url').notNull(),
  transcriptUrl: text('transcript_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
