import { Body, Controller, Get, Headers, Inject, Post, Query } from '@nestjs/common';
import { executionRequestSchema, integrationCapabilitiesSchema, type ExecutionRequest } from '@codesaga/contracts';
import { z } from 'zod';
import { ZodValidationPipe } from '../http';
import { IDENTITY_SESSION, ISOLATED_EXECUTION, type IdentitySessionPort, type IsolatedExecutionPort } from './ports';

const noQuery = new ZodValidationPipe(z.strictObject({}));

@Controller('api/v1')
export class IntegrationsController {
  constructor(
    @Inject(IDENTITY_SESSION) private readonly identity: IdentitySessionPort,
    @Inject(ISOLATED_EXECUTION) private readonly execution: IsolatedExecutionPort,
  ) {}

  @Get('capabilities')
  capabilities(@Query(noQuery) _query: Record<string, never>) {
    return integrationCapabilitiesSchema.parse({
      identity: this.identity.capabilities, execution: this.execution.capabilities,
    });
  }

  @Get('session')
  session(@Query(noQuery) _query: Record<string, never>,
    @Headers('cookie') cookie?: string, @Headers('authorization') authorization?: string) {
    return this.identity.readSession({ cookie, authorization });
  }

  @Post('executions')
  execute(@Query(noQuery) _query: Record<string, never>,
    @Body(new ZodValidationPipe(executionRequestSchema)) input: ExecutionRequest) {
    const snapshot = Object.freeze({ ...input, content: Object.freeze({ ...input.content }),
      files: input.files.map((file) => Object.freeze({ ...file })) });
    Object.freeze(snapshot.files);
    return this.execution.start(snapshot);
  }
}
