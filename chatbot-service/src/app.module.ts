import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/comicverse-chatbot',
    ),
    ChatbotModule,
  ],
})
export class AppModule {}
