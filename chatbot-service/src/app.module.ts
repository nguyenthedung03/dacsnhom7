import { Module } from '@nestjs/common';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [ChatbotModule],
})
export class AppModule {}

