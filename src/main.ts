import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLoggerAdapter } from './infrastructure/adapters/winston-logger.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLoggerAdapter(),
  });

  // Configuración de CORS restringida para Flutter
  app.enableCors({
    origin: process.env.FLUTTER_APP_ORIGIN || 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // Configuración global de prefijo
  app.setGlobalPrefix('');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Gateway API running on port ${port}`);
  console.log(`📱 CORS enabled for: ${process.env.FLUTTER_APP_ORIGIN || 'http://localhost:8080'}`);
}
bootstrap();
