import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  // ── Main chat endpoint ─────────────────────────────────────────────────
  @Post('message')
  async sendMessage(
    @Body()
    body: {
      sessionId: string;
      message: string;
      comicsContext?: any[];
      ordersContext?: any[];
      userId?: string;
      userEmail?: string;
    },
  ) {
    return this.chatbotService.chat(body.sessionId, body.message, {
      comics: body.comicsContext,
      orders: body.ordersContext,
      userId: body.userId,
      userEmail: body.userEmail,
    });
  }

  // ── AI Product Search ──────────────────────────────────────────────────
  @Post('search')
  async searchProducts(
    @Body() body: { query: string; comicsContext: any[] },
  ) {
    const results = await this.chatbotService.searchProducts(
      body.query,
      body.comicsContext || [],
    );
    return { results, total: results.length };
  }

  // ── AI Suggestions ─────────────────────────────────────────────────────
  @Post('suggest')
  async getSuggestions(
    @Body()
    body: {
      preferences: {
        genres?: string[];
        priceRange?: [number, number];
        status?: string;
      };
      comicsContext: any[];
    },
  ) {
    const results = await this.chatbotService.getSuggestions(
      body.preferences || {},
      body.comicsContext || [],
    );
    return { results, total: results.length };
  }

  // ── Chat history per session ───────────────────────────────────────────
  @Get('history/:sessionId')
  async getHistory(@Param('sessionId') sessionId: string) {
    return this.chatbotService.getHistory(sessionId);
  }

  // ── All chat history for a user ───────────────────────────────────────
  @Get('user-history/:userId')
  async getUserHistory(@Param('userId') userId: string) {
    return this.chatbotService.getUserHistory(userId);
  }

  // ── Clear session history ─────────────────────────────────────────────
  @Delete('history/:sessionId')
  async clearHistory(@Param('sessionId') sessionId: string) {
    return this.chatbotService.clearHistory(sessionId);
  }

  // ── Clear all history for a user ──────────────────────────────────────
  @Delete('user-history/:userId')
  async clearUserHistory(@Param('userId') userId: string) {
    return this.chatbotService.clearUserHistory(userId);
  }
}
