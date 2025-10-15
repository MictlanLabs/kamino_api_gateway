import { Controller, Get, Inject } from '@nestjs/common';
import type { LoggerPort } from '../../domain/ports/logger.port';
import { LOGGER_PORT } from '../../domain/ports/tokens';

@Controller('health')
export class HealthController {
  constructor(@Inject(LOGGER_PORT) private readonly logger: LoggerPort) {}

  @Get()
  getHealth() {
    this.logger.log('Health check requested', 'HealthController');
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'kamino-api-gateway',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  @Get('ready')
  getReadiness() {
    this.logger.log('Readiness check requested', 'HealthController');
    
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        jwt: 'ok',
        gateway: 'ok',
        logger: 'ok',
      },
    };
  }
}