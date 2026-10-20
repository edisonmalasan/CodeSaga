import { z } from 'zod';

/** Public transport schemas only. Never import database or private configuration here. */
export const healthSchema = z.object({
  status: z.literal('ok'),
  service: z.enum(['codesaga-api', 'codesaga-web']),
}).strict();

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    requestId: z.string().min(1).max(128),
  }).strict(),
}).strict();

export type Health = z.infer<typeof healthSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
