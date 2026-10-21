import type { NextConfig } from 'next';
import { parseWebEnvironment } from './src/environment';
import { webSecurityHeaders } from './src/security-policy';

parseWebEnvironment(process.env);

const config: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@codesaga/contracts'],
  async headers() {
    return [{ source: '/:path*', headers: Object.entries(webSecurityHeaders).map(([key, value]) => ({ key, value })) }];
  },
};

export default config;
