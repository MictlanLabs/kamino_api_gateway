import { Injectable, LoggerService } from '@nestjs/common';
import { LoggerPort } from '../../domain/ports/logger.port';

@Injectable()
export class WinstonLoggerAdapter implements LoggerPort, LoggerService {
  log(message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [LOG] ${context ? `[${context}] ` : ''}${message}`);
  }

  error(message: string, trace?: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${context ? `[${context}] ` : ''}${message}`);
    if (trace) {
      console.error(`[${timestamp}] [TRACE] ${trace}`);
    }
  }

  warn(message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${context ? `[${context}] ` : ''}${message}`);
  }

  debug(message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] [DEBUG] ${context ? `[${context}] ` : ''}${message}`);
  }

  verbose(message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [VERBOSE] ${context ? `[${context}] ` : ''}${message}`);
  }

  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userAgent?: string,
    ip?: string,
  ): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${method} ${url} ${statusCode} ${responseTime}ms${ip ? ` - ${ip}` : ''}${userAgent ? ` - ${userAgent}` : ''}`;
    console.log(`[${timestamp}] [REQUEST] ${logMessage}`);
  }
}