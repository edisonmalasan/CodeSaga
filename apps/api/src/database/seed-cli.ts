import { readConfig } from '../config';
import { createPool } from './database';
import { seed } from './seed';

async function main() {
  const pool = createPool(readConfig().DATABASE_URL);
  try {
    await seed(pool);
    console.info('Original draft catalog fixture ready');
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error && error.message.startsWith('Invalid API environment:')
    ? error.message : 'Seed failed; verify database availability and run migrations first');
  process.exitCode = 1;
});
