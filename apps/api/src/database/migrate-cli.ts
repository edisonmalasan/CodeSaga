import { readConfig } from '../config';
import { createPool } from './database';
import { migrate } from './migrate';

async function main() {
  const pool = createPool(readConfig().DATABASE_URL);
  try {
    const names = await migrate(pool);
    console.info(`Migrations complete: ${names.length} applied`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error && error.message.startsWith('Invalid API environment:')
    ? error.message : 'Migration failed; verify database availability and migration history');
  process.exitCode = 1;
});
