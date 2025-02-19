import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.development.local
config({ path: '.env.development.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function main() {
  console.log('Running migration...');
  
  // Read the migration file
  const migrationFile = readFileSync(
    join(__dirname, '../drizzle/0000_nappy_black_panther.sql'),
    'utf-8'
  );

  // Split the migration file into separate statements
  const statements = migrationFile
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Execute each statement
  for (const statement of statements) {
    console.log('Executing:', statement);
    await sql(statement);
  }

  console.log('Migration complete!');
}

main().catch(console.error);
