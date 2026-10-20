import { copyFile, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

for (const directory of ['apps/web', 'apps/api']) {
  const source = resolve(directory, '.env.example');
  const destination = resolve(directory, '.env');
  try {
    await copyFile(source, destination, constants.COPYFILE_EXCL);
    console.log(`Created ${directory}/.env from development example.`);
  } catch (error) {
    if (error.code === 'EEXIST') console.log(`Preserved existing ${directory}/.env.`);
    else throw error;
  }
}
await mkdir('.local', { recursive: true });
