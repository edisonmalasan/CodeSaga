import { z } from 'zod';

const namePattern = /^codesaga_recovery_[a-f0-9]{32}_(source|restore)$/;

export function recoveryNames(runId: string) {
  if (!/^[a-f0-9]{32}$/.test(runId)) throw new Error('Invalid recovery run identity.');
  return { source: `codesaga_recovery_${runId}_source`, restore: `codesaga_recovery_${runId}_restore` };
}

/** Only names created successfully by this invocation may be dropped/restored. */
export function ownedDatabaseIdentifier(name: string, created: ReadonlySet<string>): string {
  if (!namePattern.test(name) || !created.has(name)) throw new Error('Database is outside this recovery run.');
  return `"${name}"`;
}

export function assertLocalDocker(endpoint: string, environment: NodeJS.ProcessEnv): void {
  if (environment.DOCKER_HOST || environment.DOCKER_CONTEXT ||
      !/^(?:unix:\/\/\/[^\s]+|npipe:\/\/\/\/\.\/pipe\/[^\s]+)$/.test(endpoint)) {
    throw new Error('Recovery requires the current local Docker socket without host/context overrides.');
  }
}

const fixtureSchema = z.object({
  Config: z.object({ Image: z.literal('postgres:18.6-alpine'), Labels: z.record(z.string(), z.string()) }),
  State: z.object({ Running: z.literal(true) }),
  NetworkSettings: z.object({ Ports: z.object({
    '5432/tcp': z.array(z.object({ HostIp: z.literal('127.0.0.1'), HostPort: z.string().regex(/^\d{1,5}$/) })).length(1),
  }) }),
});

export function fixturePort(inspected: unknown): number {
  const result = fixtureSchema.safeParse(inspected);
  if (!result.success || result.data.Config.Labels['com.docker.compose.project'] !== 'codesaga' ||
      result.data.Config.Labels['com.docker.compose.service'] !== 'postgres') {
    throw new Error('Recovery requires the pinned, running, loopback-bound CodeSaga PostgreSQL fixture.');
  }
  const port = Number(result.data.NetworkSettings.Ports['5432/tcp'][0]!.HostPort);
  if (port < 1 || port > 65535) throw new Error('Invalid PostgreSQL fixture port.');
  return port;
}
