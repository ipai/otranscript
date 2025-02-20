# OTranscript
Web app for transcribing audio with Deepgram and Next.js. Currently deployed on Vercel, using Drizzle ORM for the database with Neon as underlying Postgresql database. The blobs are stored on Vercel Blob storage. Vercel project is linked to Github, and the source code is deployed automatically whenever a change is pushed to the repository.

## Development
### Install vercel CLI
```bash
npm install -g vercel
```
### Link Vercel project
```bash
vercel link
```
### Pull the secrets
```bash
vercel env pull .env
```
### Run locally
```bash
npm install && npm run dev
```
### Schema Migration
1. Change the schema in `lib/db/schema.ts`
2. Run the following to push changes to the DB
```bash
vercel env pull .env
```
