import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  healthCheck() {
    return {
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
