import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Create the neon client
const sql = neon(process.env.DATABASE_URL!);

// Create and export the drizzle client
export const db = drizzle(sql);

// Export database schema types
export * from './schema';
