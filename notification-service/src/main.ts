import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { startComicCreatedConsumer } from './rabbitmq/comic-created.consumer';

async function bootstrap() {
  await startComicCreatedConsumer();

  const app = await NestFactory.create(AppModule);

  await app.listen(3004);
}
bootstrap();