import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  healthCheck() {
    return {
      status: 'OK',
      service: 'API Gateway',
      timestamp: new Date(),
    };
  }
}