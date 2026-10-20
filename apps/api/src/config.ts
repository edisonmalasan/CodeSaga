import { z } from 'zod';

const postgresUrl = z.string().url().refine((value) => {
  try {
    const url = new URL(value);
    return ['postgres:', 'postgresql:'].includes(url.protocol) &&
      Boolean(url.hostname && url.username && url.pathname.length > 1) && !url.hash;
  } catch { return false; }
});

const origin = z.string().url().refine((value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === value &&
      !url.username && !url.password;
  } catch { return false; }
});

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  HOST: z.enum(['127.0.0.1', '0.0.0.0', '::1', '::']).default('127.0.0.1'),
  DATABASE_URL: postgresUrl,
  CORS_ORIGINS: z.string().transform((value) => value.split(',').map((item) => item.trim()))
    .pipe(z.array(origin).min(1)),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV === 'production' && value.CORS_ORIGINS.some((item) => !item.startsWith('https://'))) {
    ctx.addIssue({ code: 'custom', path: ['CORS_ORIGINS'], message: 'HTTPS required' });
  }
});

export type ApiConfig = z.infer<typeof environmentSchema>;

export function readConfig(environment: NodeJS.ProcessEnv = process.env): ApiConfig {
  const result = environmentSchema.safeParse(environment);
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))].sort();
    // Never include values, Zod input, URLs or database credentials in startup errors.
    throw new Error(`Invalid API environment: ${fields.join(', ')}`);
  }
  return result.data;
}
