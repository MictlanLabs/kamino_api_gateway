import { Injectable, Inject } from '@nestjs/common';
import type { AuthPort } from '../ports/auth.port';
import type { GatewayPort } from '../ports/gateway.port';
import type { LoggerPort } from '../ports/logger.port';
import { RequestEntity } from '../entities/request.entity';
import { AUTH_PORT, GATEWAY_PORT, LOGGER_PORT } from '../ports/tokens';

@Injectable()
export class GatewayService {
  constructor(
    @Inject(AUTH_PORT) private readonly authPort: AuthPort,
    @Inject(GATEWAY_PORT) private readonly gatewayPort: GatewayPort,
    @Inject(LOGGER_PORT) private readonly loggerPort: LoggerPort,
  ) {}

  async processRequest(request: RequestEntity): Promise<any> {
    const startTime = Date.now();
    
    try {
      // NEW: permitir desactivar autenticación por configuración
      const authDisabled =
        process.env.AUTH_DISABLED === 'true' || process.env.AUTH_REQUIRED === 'false';
      
      let enhancedHeaders = { ...request.headers };

      if (!authDisabled) {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new Error('Missing or invalid authorization header');
        }

        const token = authHeader.substring(7);
        const isValidToken = await this.authPort.validateToken(token);
        
        if (!isValidToken) {
          throw new Error('Invalid JWT token');
        }

        const user = await this.authPort.extractUserFromToken(token);
        
        enhancedHeaders = {
          ...enhancedHeaders,
          'x-user-id': user.id,
          'x-user-email': user.email,
        };
      } else {
        this.loggerPort.warn('JWT validation disabled by configuration', 'GatewayService');
      }

      // Enrutar la petición
      const serviceRoute = request.getServiceRoute();
      const targetUrl = this.getServiceUrl(serviceRoute);
      const finalUrl = request.getTargetUrl(targetUrl);

      this.loggerPort.log(
        `Routing request to ${serviceRoute} service: ${request.method} ${finalUrl}`,
        'GatewayService',
      );

      // Reenviar la petición
      const response = await this.gatewayPort.forwardRequest(
        request.method,
        finalUrl,
        enhancedHeaders,
        request.body,
      );

      const responseTime = Date.now() - startTime;
      
      // Log de la petición exitosa
      this.loggerPort.logRequest(
        request.method,
        request.url,
        200,
        responseTime,
        request.userAgent,
        request.ip,
      );

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.loggerPort.error(
        `Gateway error: ${error.message}`,
        error.stack,
        'GatewayService',
      );

      this.loggerPort.logRequest(
        request.method,
        request.url,
        error.message.includes('Invalid JWT') ? 401 : 500,
        responseTime,
        request.userAgent,
        request.ip,
      );

      throw error;
    }
  }

  private getServiceUrl(serviceRoute: string): string {
    const serviceUrls = {
      users: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
      places: process.env.PLACES_SERVICE_URL || 'http://localhost:3002',
      routes: process.env.ROUTES_SERVICE_URL || 'http://localhost:3003',
      narrator: process.env.NARRATOR_SERVICE_URL || 'http://localhost:3004',
    };

    return serviceUrls[serviceRoute];
  }
}