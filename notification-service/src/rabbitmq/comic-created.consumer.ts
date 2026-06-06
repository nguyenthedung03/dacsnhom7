import * as amqp from 'amqplib';

export async function startComicCreatedConsumer() {
  const connection = await amqp.connect('amqp://rabbitmq:5672');

  const channel = await connection.createChannel();

  await channel.assertQueue('comic.created');
  await channel.assertQueue('chapter.created');

  console.log('Notification Service connected to RabbitMQ');

  channel.consume('comic.created', (message) => {
    if (!message) {
      return;
    }

    const data = JSON.parse(message.content.toString());

    console.log('Received event comic.created:', data);

    console.log(
      `Notification: New comic created - ${data.title}`,
    );

    channel.ack(message);
  });

  channel.consume('chapter.created', (message) => {
    if (!message) {
      return;
    }

    const data = JSON.parse(message.content.toString());

    console.log('Received event chapter.created:', data);

    console.log(
      `Notification: New chapter added - Chapter ${data.chapterNumber}`,
    );

    channel.ack(message);
  });
}