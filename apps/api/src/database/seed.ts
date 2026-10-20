import type { Pool } from 'pg';

export async function seed(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`INSERT INTO courses (id, slug, title, summary) VALUES
      ('a1000000-0000-4000-8000-000000000001', 'python-first-steps', 'Python first steps',
       'Original draft content for the CodeSaga foundation fixture.') ON CONFLICT (id) DO NOTHING`);
    await client.query(`INSERT INTO chapters (id, course_id, slug, title, position) VALUES
      ('a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001',
       'messages', 'Make a message', 0) ON CONFLICT (id) DO NOTHING`);
    await client.query(`INSERT INTO lessons (id, chapter_id, slug, position) VALUES
      ('a3000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001',
       'first-message', 0) ON CONFLICT (id) DO NOTHING`);
    await client.query(`INSERT INTO lesson_versions (id, lesson_id, version, title, body, provenance)
      VALUES ($1, $2, 1, $3, $4, $5) ON CONFLICT (lesson_id, version) DO NOTHING`, [
      'a4000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000001',
      'Your first message',
      'A program can share a message. In Python, print("Hello, CodeSaga!") displays the text between the quotation marks. Change the message to introduce yourself.',
      'Original CodeSaga scaffold fixture; authored for this repository. No reference-product content or assets.',
    ]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
