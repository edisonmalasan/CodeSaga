import { Controller, Get, Inject, Query } from '@nestjs/common';
import { healthSchema } from '@codesaga/contracts';
import { z } from 'zod';
import { DATABASE, type Database } from './database/database';
import { PublicError, ZodValidationPipe } from './http';

// Operational endpoints accept no query options. No user/content DTO exists yet.
const noQuery = new ZodValidationPipe(z.strictObject({}));

@Controller()
export class HealthController {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  @Get('health')
  live(@Query(noQuery) _query: Record<string, never>) {
    return healthSchema.parse({ status: 'ok', service: 'codesaga-api' });
  }

  @Get('ready')
  async ready(@Query(noQuery) _query: Record<string, never>) {
    try {
      await this.database.check();
    } catch {
      throw new PublicError('DATABASE_UNAVAILABLE', 'Database unavailable', 503);
    }
    return healthSchema.parse({ status: 'ok', service: 'codesaga-api' });
  }
}
