import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

// Explicitly opt routes into telemetry. Never fall back to a URL or path parameter.
const routes = new Set([
  '/health', '/ready', '/api/v1/capabilities', '/api/v1/session', '/api/v1/executions',
  '/api/v1/content/catalog', '/api/v1/content/courses/:course',
  '/api/v1/content/courses/:course/chapters/:chapter',
  '/api/v1/content/courses/:course/lessons/:lesson', '/api/v1/content/resources/:resource',
]);
const methods = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

export type RequestTelemetry = Readonly<{
  schemaVersion: 1;
  event: 'http_request';
  timestamp: string;
  traceId: string;
  method: string;
  route: string;
  outcome: 'finished' | 'aborted';
  statusCode: number | null;
  durationMs: number;
}>;
export type RequestTelemetrySink = (event: RequestTelemetry) => void;

export const writeRequestTelemetry: RequestTelemetrySink = (event) => console.info(JSON.stringify(event));

export function requestTelemetryMiddleware(sink: RequestTelemetrySink) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const started = process.hrtime.bigint();
    // Caller IDs can contain personal text even when syntactically valid. Only this
    // independent server-generated ID enters telemetry; existing request IDs remain compatible.
    const traceId = randomUUID();
    res.setHeader('x-trace-id', traceId);
    let recorded = false;
    const record = (outcome: RequestTelemetry['outcome']) => {
      if (recorded) return;
      recorded = true;
      res.off('finish', finished);
      res.off('close', closed);
      const route: unknown = req.route?.path;
      const event: RequestTelemetry = Object.freeze({
        schemaVersion: 1, event: 'http_request', timestamp: new Date().toISOString(), traceId,
        method: methods.has(req.method) ? req.method : 'OTHER',
        route: typeof route === 'string' && routes.has(route) ? route : 'unresolved',
        outcome, statusCode: outcome === 'finished' ? res.statusCode : null,
        durationMs: Math.round(Number(process.hrtime.bigint() - started) / 1e3) / 1e3,
      });
      // A collector failure must not fail the request or recursively log its payload/error.
      try { sink(event); } catch { /* Collector delivery policy remains an operating gate. */ }
    };
    const finished = () => record('finished');
    const closed = () => record('aborted');
    res.once('finish', finished);
    res.once('close', closed);
    next();
  };
}
