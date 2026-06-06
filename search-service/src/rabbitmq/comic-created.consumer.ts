import * as amqp from 'amqplib';
import { SearchService } from '../search/search.service';

export async function startComicCreatedConsumer(
  searchService: SearchService,
) {
  const connection = await amqp.connect(
    'amqp://rabbitmq:5672',
  );

  const channel = await connection.createChannel();

  await channel.assertQueue('comic.created');

  console.log('Search Service connected to RabbitMQ');

  channel.consume('comic.created', async (message) => {
    if (!message) {
      return;
    }

    const data = JSON.parse(message.content.toString());

    console.log('Received event comic.created:', data);

    await searchService.indexComic(data);

    channel.ack(message);
  });
}