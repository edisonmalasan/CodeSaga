import { healthSchema } from '@codesaga/contracts';

export function GET() {
  return Response.json(healthSchema.parse({ status: 'ok', service: 'codesaga-web' }));
}
