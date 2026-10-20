import type { ExecutionRequest, IntegrationCapabilities } from '@codesaga/contracts';

export const IDENTITY_SESSION = Symbol('IDENTITY_SESSION');
export const ISOLATED_EXECUTION = Symbol('ISOLATED_EXECUTION');

/** Internal provider boundary. Credentials are opaque until verified by an adapter. */
export interface SessionCredentials {
  readonly cookie?: string;
  readonly authorization?: string;
}

export interface IdentitySessionPort {
  readonly capabilities: IntegrationCapabilities['identity'];
  readSession(credentials: SessionCredentials): Promise<{
    readonly accountId: string;
    readonly expiresAt: string;
  } | null>;
}

/** No configured implementation exists. Ownership/quota policy gates future dispatch. */
export interface IsolatedExecutionPort {
  readonly capabilities: IntegrationCapabilities['execution'];
  start(snapshot: Readonly<ExecutionRequest>): Promise<{ readonly jobId: string }>;
}

export class IntegrationUnavailableError extends Error {
  constructor(readonly integration: 'identity' | 'execution') {
    super('Integration unavailable');
  }
}

export class UnavailableIdentitySession implements IdentitySessionPort {
  readonly capabilities = Object.freeze({ available: false, status: 'not_configured' } as const);

  async readSession(_credentials: SessionCredentials): Promise<never> {
    throw new IntegrationUnavailableError('identity');
  }
}

export class UnavailableIsolatedExecution implements IsolatedExecutionPort {
  readonly capabilities: IntegrationCapabilities['execution'] = Object.freeze({
    available: false, status: 'not_configured', runtimes: Object.freeze([]) as never[],
  });

  async start(_snapshot: Readonly<ExecutionRequest>): Promise<never> {
    throw new IntegrationUnavailableError('execution');
  }
}
