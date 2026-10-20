import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function* files(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

let traces = 0;
for await (const path of files('apps/web/.next')) {
  if (!path.endsWith('.nft.json')) continue;
  const trace = JSON.parse(await readFile(path, 'utf8'));
  traces++;
  for (const file of trace.files) {
    const normalized = file.replaceAll('\\', '/');
    assert(!/(^|\/)re\//.test(normalized), `Research found in production trace: ${path}`);
    assert(!/(^|\/)apps\/api\//.test(normalized), `Backend source found in web trace: ${path}`);
    assert(!/(^|\/)\.env(?:\.|$)/.test(normalized), `Environment file found in web trace: ${path}`);
  }
}
assert(traces > 0, 'Build the web application before auditing production traces.');

let chunks = 0;
for await (const path of files('apps/web/.next/static')) {
  if (!path.endsWith('.js')) continue;
  chunks++;
  const source = await readFile(path, 'utf8');
  assert(!/codedex\.io|DATABASE_URL|POSTGRES_PASSWORD|S3_SECRET_ACCESS_KEY/.test(source), `Private/reference configuration found in client chunk: ${path}`);
  const canary = process.env.CODESAGA_BUILD_SECRET_CANARY;
  if (canary) assert(!source.includes(canary), `Build secret canary found in client chunk: ${path}`);
}
console.log(`Production boundary audit passed: ${traces} dependency traces, ${chunks} client chunks. Secret canary ${process.env.CODESAGA_BUILD_SECRET_CANARY ? 'checked' : 'not supplied'}.`);
