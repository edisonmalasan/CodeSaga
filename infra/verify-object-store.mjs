import assert from 'node:assert/strict';
import { createHash, createHmac, randomUUID } from 'node:crypto';

// Local fixture smoke check only; no production endpoints or credentials are read.
const port = Number(process.env.MINIO_PORT ?? 9000);
assert.ok(Number.isInteger(port) && port >= 1 && port <= 65535, 'Invalid MINIO_PORT');
const endpoint = new URL(`http://127.0.0.1:${port}`);
const accessKey = 'codesaga_local';
const secretKey = 'codesaga_minio_local_only';
const bucket = `codesaga-check-${randomUUID()}`;
const hash = (value) => createHash('sha256').update(value).digest('hex');
const hmac = (key, value) => createHmac('sha256', key).update(value).digest();

async function request(method, path, body = '') {
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = timestamp.slice(0, 8);
  const scope = `${date}/us-east-1/s3/aws4_request`;
  const digest = hash(body);
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonical = [method, path, '',
    `host:${endpoint.host}\nx-amz-content-sha256:${digest}\nx-amz-date:${timestamp}\n`,
    signedHeaders, digest].join('\n');
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, date), 'us-east-1'), 's3'), 'aws4_request');
  const signature = createHmac('sha256', signingKey)
    .update(`AWS4-HMAC-SHA256\n${timestamp}\n${scope}\n${hash(canonical)}`).digest('hex');
  return fetch(new URL(path, endpoint), {
    method,
    headers: {
      'x-amz-date': timestamp,
      'x-amz-content-sha256': digest,
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    ...(method === 'PUT' ? { body } : {}),
    signal: AbortSignal.timeout(10000),
  });
}

try {
  const health = await fetch(new URL('/minio/health/ready', endpoint), { signal: AbortSignal.timeout(10000) });
  assert.equal(health.status, 200, 'MinIO readiness failed');
  const created = await request('PUT', `/${bucket}`);
  assert.equal(created.status, 200, 'MinIO temporary bucket creation failed');
  try {
    const body = 'Original CodeSaga local fixture probe';
    assert.equal((await request('PUT', `/${bucket}/probe.txt`, body)).status, 200, 'MinIO object write failed');
    const read = await request('GET', `/${bucket}/probe.txt`);
    assert.equal(read.status, 200, 'MinIO object read failed');
    assert.equal(await read.text(), body, 'MinIO object content mismatch');
  } finally {
    assert.equal((await request('DELETE', `/${bucket}/probe.txt`)).status, 204, 'MinIO object cleanup failed');
    assert.equal((await request('DELETE', `/${bucket}`)).status, 204, 'MinIO bucket cleanup failed');
  }
  console.log('MinIO fixture: readiness, signed bucket/object write/read and cleanup passed');
} catch {
  console.error('MinIO fixture check failed; start local services and verify the configured local port');
  process.exitCode = 1;
}
