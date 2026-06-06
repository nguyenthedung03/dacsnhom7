import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SearchService } from './search/search.service';
import { startComicCreatedConsumer } from './rabbitmq/comic-created.consumer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const searchService = app.get(SearchService);

  await startComicCreatedConsumer(searchService);

  await app.listen(3005);
}
bootstrap();