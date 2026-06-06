import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectRabbitMQ } from './rabbitmq/rabbitmq.provider';

import { NestExpressApplication } from '@nestjs/platform-express';

import { join } from 'path';

import * as express from 'express';

async function bootstrap() {
  await connectRabbitMQ();

  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  app.use(
    '/uploads',
    express.static(
      join(process.cwd(), 'uploads'),
    ),
  );

  await app.listen(3003);
}
bootstrap();