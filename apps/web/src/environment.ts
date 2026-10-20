import { z } from 'zod';

const httpOrigin = z.url().refine((value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === value && !url.username && !url.password;
  } catch {
    return false;
  }
}, 'Use an HTTP(S) origin without a path or credentials');

const webEnvironmentSchema = z.object({
  API_BASE_URL: httpOrigin,
  WEB_ORIGIN: httpOrigin,
});

export function parseWebEnvironment(input: Record<string, unknown>) {
  const result = webEnvironmentSchema.safeParse(input);
  if (!result.success) {
    // Report names and validation reasons, never environment values.
    throw new Error(`Invalid web environment: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
  }
  return result.data;
}
