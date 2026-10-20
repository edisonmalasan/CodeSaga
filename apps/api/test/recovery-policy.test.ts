import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { assertLocalDocker, fixturePort, ownedDatabaseIdentifier, recoveryNames } from '../scripts/recovery-policy';

test('recovery cleanup accepts only generated names successfully owned by this invocation', () => {
  const names = recoveryNames('0123456789abcdef0123456789abcdef');
  const owned = new Set([names.source]);
  assert.equal(ownedDatabaseIdentifier(names.source, owned), `"${names.source}"`);
  assert.ok(names.restore.length < 64);
  for (const name of [names.restore, 'codesaga', 'postgres', 'codesaga_recovery_previous_source', 'bad"; DROP DATABASE codesaga;--']) {
    assert.throws(() => ownedDatabaseIdentifier(name, owned));
  }
  assert.throws(() => ownedDatabaseIdentifier('codesaga', new Set(['codesaga'])));
  assert.throws(() => recoveryNames('untrusted-run-id'));
});

test('recovery rejects remote Docker contexts and explicit routing overrides', () => {
  for (const endpoint of ['unix:///var/run/docker.sock', 'npipe:////./pipe/dockerDesktopLinuxEngine']) {
    assert.doesNotThrow(() => assertLocalDocker(endpoint, {}));
  }
  for (const endpoint of ['tcp://localhost:2375', 'ssh://remote', 'https://remote', '', 'unix://remote/socket']) {
    assert.throws(() => assertLocalDocker(endpoint, {}));
  }
  assert.throws(() => assertLocalDocker('unix:///var/run/docker.sock', { DOCKER_HOST: 'tcp://remote:2375' }));
  assert.throws(() => assertLocalDocker('unix:///var/run/docker.sock', { DOCKER_CONTEXT: 'other' }));
});

test('recovery resolves only the pinned local Compose PostgreSQL fixture port', () => {
  const fixture = () => ({
    Config: { Image: 'postgres:18.6-alpine', Labels: { 'com.docker.compose.project': 'codesaga', 'com.docker.compose.service': 'postgres' } },
    State: { Running: true },
    NetworkSettings: { Ports: { '5432/tcp': [{ HostIp: '127.0.0.1', HostPort: '55432' }] } },
  });
  assert.equal(fixturePort(fixture()), 55432);
  const cases = [fixture(), fixture(), fixture(), fixture(), fixture(), fixture()];
  cases[0]!.Config.Image = 'postgres:latest';
  cases[1]!.Config.Labels['com.docker.compose.project'] = 'other';
  cases[2]!.NetworkSettings.Ports['5432/tcp'][0]!.HostIp = '0.0.0.0';
  cases[3]!.NetworkSettings.Ports['5432/tcp'][0]!.HostPort = '99999';
  cases[4]!.State.Running = false;
  cases[5]!.NetworkSettings.Ports['5432/tcp'].push({ HostIp: '127.0.0.1', HostPort: '5432' });
  for (const value of [...cases, null, {}]) assert.throws(() => fixturePort(value));
});
