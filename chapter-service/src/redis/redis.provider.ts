import { createClient } from 'redis';

export const redisClient = createClient({
  url: 'redis://redis:6379',
});

redisClient.connect();

redisClient.on('error', (err) => {
  console.log('Redis Error:', err);
});