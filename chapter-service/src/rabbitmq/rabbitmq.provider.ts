import * as amqp from 'amqplib';

let channel: amqp.Channel;

export async function connectRabbitMQ() {
  const connection = await amqp.connect(
    'amqp://rabbitmq:5672',
  );

  channel = await connection.createChannel();

  await channel.assertQueue('chapter.created');

  console.log('RabbitMQ Connected');
}

export function getChannel() {
  return channel;
}