import { createApp } from './app';
import { readConfig } from './config';

async function main() {
  const config = readConfig();
  const app = await createApp(config);
  await app.listen(config.PORT, config.HOST);
  console.info(`CodeSaga API listening on port ${config.PORT}`);
}

main().catch((error: unknown) => {
  // Only environment field names are safe to print; never dump provider errors.
  const message = error instanceof Error && error.message.startsWith('Invalid API environment:')
    ? error.message : 'API startup failed';
  console.error(message);
  process.exitCode = 1;
});
