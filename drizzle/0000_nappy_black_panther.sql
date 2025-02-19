CREATE TABLE "transcripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audio_url" text NOT NULL,
	"transcript_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
