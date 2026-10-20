import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ApiConfig } from './config';
import { DATABASE, createDatabase, type Database } from './database/database';
import { HealthController } from './health.controller';
import { ApiExceptionFilter, PublicError, requestIdMiddleware } from './http';

export async function createApp(config: ApiConfig, database: Database = createDatabase(config)) {
  @Module({
    controllers: [HealthController],
    providers: [
      { provide: DATABASE, useValue: database },
      { provide: 'DATABASE_SHUTDOWN', useValue: { onApplicationShutdown: () => database.close() } },
    ],
  })
  class ApiModule {}

  const app = await NestFactory.create<NestExpressApplication>(ApiModule, {
    bodyParser: false,
    logger: false,
  });
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use(requestIdMiddleware);
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableCors({
    origin(value, callback) {
      if (!value || config.CORS_ORIGINS.includes(value)) callback(null, true);
      else callback(new PublicError('ORIGIN_NOT_ALLOWED', 'Origin not allowed', 403), false);
    },
    methods: ['GET', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    credentials: false,
    maxAge: 600,
  });
  app.useBodyParser('json', { limit: '64kb' });
  app.useBodyParser('urlencoded', { limit: '64kb', extended: false });
  app.enableShutdownHooks();
  return app;
}
