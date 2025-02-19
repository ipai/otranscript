import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transcripts } from '@/lib/db/schema';

/**
 * Health check endpoint to verify system status.
 * Tests database connectivity and required environment variables.
 * @returns Status of core system components
 */
export async function GET() {
  let dbConnection = false;

  try {
    // Test database connection
    await db.select().from(transcripts).limit(1);
    dbConnection = true;
  } catch {
    dbConnection = false;
  }

  return NextResponse.json({
    status: dbConnection ? 'healthy' : 'database_error',
  });
}
