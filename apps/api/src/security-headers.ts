import type { IncomingMessage, ServerResponse } from 'node:http';

export function securityHeaders(_request: IncomingMessage, response: ServerResponse, next: () => void) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // This server returns JSON, never executable documents or learner previews.
  response.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  next();
}
