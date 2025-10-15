import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return {
      name: 'Kamino API Gateway',
      version: '1.0.0',
      description: 'Gateway API para microservicios con arquitectura hexagonal',
      endpoints: {
        health: '/health',
        ready: '/health/ready',
        api: '/api/*',
      },
    };
  }
}
