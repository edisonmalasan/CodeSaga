import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { webContentSecurityPolicy } from './src/security-policy';

export function proxy(request: NextRequest) {
  const nonce = randomBytes(24).toString('base64');
  const policy = webContentSecurityPolicy(nonce, process.env.NODE_ENV === 'development');
  const requestHeaders = new Headers(request.headers);
  // Never trust a caller's nonce or CSP. Next.js reads the internal CSP header
  // to authorize its generated scripts; the layout reads our internal nonce.
  requestHeaders.set('x-codesaga-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', policy);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', policy);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static(?:/|$)|_next/image(?:/|$)|media/|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|health$).*)'],
};
