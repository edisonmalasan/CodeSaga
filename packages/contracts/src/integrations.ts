import { z } from 'zod';

// This slice has no configured providers. A future adapter must expand this
// contract deliberately after verification, rather than flip a boolean flag.
export const integrationCapabilitiesSchema = z.strictObject({
  identity: z.strictObject({ available: z.literal(false), status: z.literal('not_configured') }),
  execution: z.strictObject({ available: z.literal(false), status: z.literal('not_configured'), runtimes: z.array(z.never()).max(0) }),
});

export const executionRequestSchema = z.strictObject({
  runtime: z.literal('python'),
  content: z.strictObject({ id: z.uuid(), version: z.number().int().positive() }),
  entry: z.literal('main.py'),
  files: z.array(z.strictObject({ path: z.literal('main.py'), source: z.string().max(32000) })).length(1),
});

export type IntegrationCapabilities = z.infer<typeof integrationCapabilitiesSchema>;
export type ExecutionRequest = z.infer<typeof executionRequestSchema>;
