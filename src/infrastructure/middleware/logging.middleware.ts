import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import type { LoggerPort } from '../../domain/ports/logger.port';
import { LOGGER_PORT } from '../../domain/ports/tokens';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(@Inject(LOGGER_PORT) private readonly logger: LoggerPort) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';

    // Log de petición entrante
    this.logger.log(
      `Incoming request: ${method} ${originalUrl} from ${ip}`,
      'LoggingMiddleware',
    );

    // Interceptar la respuesta
    const originalSend = res.send;
    res.send = function (body) {
      const responseTime = Date.now() - startTime;
      
      // Log de respuesta
      req['logger'].logRequest(
        method,
        originalUrl,
        res.statusCode,
        responseTime,
        userAgent,
        ip,
      );

      return originalSend.call(this, body);
    };

    // Pasar el logger al request para uso posterior
    req['logger'] = this.logger;

    next();
  }
}