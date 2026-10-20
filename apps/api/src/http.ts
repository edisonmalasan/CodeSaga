import { randomUUID } from 'node:crypto';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, PipeTransform, BadRequestException } from '@nestjs/common';
import { apiErrorSchema } from '@codesaga/contracts';
import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';
import { IntegrationUnavailableError } from './integrations/ports';

export class PublicError extends HttpException {
  constructor(public readonly code: string, message: string, status: number) {
    super(message, status);
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const supplied = req.headers['x-request-id'];
  const requestId = typeof supplied === 'string' && /^[A-Za-z0-9._-]{1,128}$/.test(supplied)
    ? supplied : randomUUID();
  res.locals.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: z.ZodType<T>) {}
  transform(value: unknown): T {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) throw new BadRequestException('Invalid request');
    return parsed.data;
  }
}

const knownErrors: Record<number, [string, string]> = {
  400: ['INVALID_REQUEST', 'Invalid request'],
  401: ['UNAUTHENTICATED', 'Authentication required'],
  403: ['FORBIDDEN', 'Request forbidden'],
  404: ['NOT_FOUND', 'Route not found'],
  405: ['METHOD_NOT_ALLOWED', 'Method not allowed'],
  409: ['CONFLICT', 'Request conflicts with current state'],
  413: ['PAYLOAD_TOO_LARGE', 'Request body too large'],
  415: ['UNSUPPORTED_MEDIA_TYPE', 'Unsupported media type'],
  429: ['RATE_LIMITED', 'Too many requests'],
  503: ['SERVICE_UNAVAILABLE', 'Service unavailable'],
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    let status = exception instanceof HttpException ? exception.getStatus() : 500;
    // Express body parser errors use status/type rather than Nest HttpException.
    if (exception && typeof exception === 'object' && 'type' in exception) {
      if (exception.type === 'entity.parse.failed') status = 400;
      if (exception.type === 'entity.too.large') status = 413;
    }
    if (exception instanceof IntegrationUnavailableError) status = 503;
    const [code, message] = exception instanceof IntegrationUnavailableError
      ? exception.integration === 'identity'
        ? ['IDENTITY_NOT_CONFIGURED', 'Identity service not configured']
        : ['EXECUTION_NOT_CONFIGURED', 'Execution service not configured']
      : exception instanceof PublicError
      ? [exception.code, exception.message]
      : knownErrors[status] ?? ['INTERNAL_ERROR', 'Internal server error'];
    const requestId = response.locals.requestId ?? randomUUID();
    response.setHeader('x-request-id', requestId);
    response.status(status).json(apiErrorSchema.parse({ error: { code, message, requestId } }));
  }
}
