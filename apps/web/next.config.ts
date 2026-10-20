import type { NextConfig } from 'next';
import { parseWebEnvironment } from './src/environment';

parseWebEnvironment(process.env);

const config: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@codesaga/contracts'],
};

export default config;
