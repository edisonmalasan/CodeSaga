import { Pool } from 'pg';
import type { ApiConfig } from '../config';

export const DATABASE = Symbol('DATABASE');

export interface Database {
  check(): Promise<void>;
  close(): Promise<void>;
}

export function createPool(connectionString: string): Pool {
  const pool = new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 1500,
    idleTimeoutMillis: 10000,
    statement_timeout: 1500,
    query_timeout: 2000,
    application_name: 'codesaga-api',
  });
  // An idle socket can fail outside a request; don't crash or print connection secrets.
  pool.on('error', () => console.error('PostgreSQL idle connection unavailable'));
  return pool;
}

export function createDatabase(config: ApiConfig): Database {
  const pool = createPool(config.DATABASE_URL);
  return {
    async check() { await pool.query('SELECT 1'); },
    async close() { await pool.end(); },
  };
}
