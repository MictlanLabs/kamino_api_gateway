import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLoggerAdapter } from './infrastructure/adapters/winston-logger.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLoggerAdapter(),
    bodyParser: false,
  });

  const normalizeOrigin = (v?: string) => (v ? v.replace(/^(["'`\s]+)|(["'`\s]+)$/g, '') : '');
  const envList = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => normalizeOrigin(s))
    .filter((s) => !!s);
  const flutter = normalizeOrigin(process.env.FLUTTER_APP_ORIGIN);
  const allowedOrigins = new Set<string>([...envList, ...(flutter ? [flutter] : [])]);
  const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

  app.enableCors({
    origin: (origin, callback) => {
      const allowed = !origin || allowedOrigins.has(origin) || localhostRegex.test(origin);
      callback(null, allowed);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  app.setGlobalPrefix('');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Gateway API running on port ${port}`);
  console.log(
    `CORS allowed origins: ${Array.from(allowedOrigins).join(', ') || '(none)'}; localhost enabled`
  );
}
bootstrap();