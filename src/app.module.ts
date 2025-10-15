import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayController } from './infrastructure/controllers/gateway.controller';
import { HealthController } from './infrastructure/controllers/health.controller';
import { GatewayService } from './domain/services/gateway.service';
import { JwtAuthAdapter } from './infrastructure/adapters/jwt-auth.adapter';
import { HttpGatewayAdapter } from './infrastructure/adapters/http-gateway.adapter';
import { WinstonLoggerAdapter } from './infrastructure/adapters/winston-logger.adapter';
import { LoggingMiddleware } from './infrastructure/middleware/logging.middleware';
import { CustomThrottlerGuard } from './infrastructure/guards/throttler.guard';
import { AUTH_PORT, GATEWAY_PORT, LOGGER_PORT } from './domain/ports/tokens';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      },
    ]),
  ],
  controllers: [AppController, GatewayController, HealthController],
  providers: [
    AppService,
    GatewayService,
    {
      provide: AUTH_PORT,
      useClass: JwtAuthAdapter,
    },
    {
      provide: GATEWAY_PORT,
      useClass: HttpGatewayAdapter,
    },
    {
      provide: LOGGER_PORT,
      useClass: WinstonLoggerAdapter,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
