export const webSecurityHeaders = {
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export function webContentSecurityPolicy(nonce: string, development: boolean) {
  if (!/^[A-Za-z0-9+/]{32}$/.test(nonce)) throw new Error('Invalid document nonce');
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    // Next.js and native UI may set style attributes. Script permission remains
    // nonce-based; allowing inline CSS does not allow inline JavaScript.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self'",
    "font-src 'self'",
    `connect-src 'self'${development ? ' ws: wss:' : ''}`,
    'frame-src https://www.youtube-nocookie.com https://player.vimeo.com',
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'none'",
    "media-src 'none'",
  ].join('; ');
}
