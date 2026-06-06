import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  async sendMessage(
    @Body() body: { sessionId: string; message: string; comicsContext?: any[] },
  ) {
    return this.chatbotService.chat(
      body.sessionId,
      body.message,
      body.comicsContext,
    );
  }

  @Get('history/:sessionId')
  async getHistory(@Param('sessionId') sessionId: string) {
    return this.chatbotService.getHistory(sessionId);
  }

  @Delete('history/:sessionId')
  async clearHistory(@Param('sessionId') sessionId: string) {
    return this.chatbotService.clearHistory(sessionId);
  }
}
