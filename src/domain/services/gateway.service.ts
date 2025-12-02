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
      const authDisabled =
        process.env.AUTH_DISABLED === 'true' || process.env.AUTH_REQUIRED === 'false';

      const serviceRoute = request.getServiceRoute();
      let enhancedHeaders = { ...request.headers };

      const requireAuthForPlaces = !authDisabled && (serviceRoute === 'places' || serviceRoute === 'routes');
      if (requireAuthForPlaces) {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          this.loggerPort.warn('AuthMissingToken: falta Authorization Bearer para places', 'GatewayService');
          throw new Error('AuthMissingToken');
        }

        const token = authHeader.substring(7);
        const isValidToken = await this.authPort.validateToken(token);
        if (!isValidToken) {
          this.loggerPort.warn('AuthInvalidToken: JWT inválido o expirado para places', 'GatewayService');
          throw new Error('AuthInvalidToken');
        }

        const user = await this.authPort.extractUserFromToken(token);

        const allowed = (process.env.PLACES_ALLOWED_ROLES || '')
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean);

        if (allowed.length > 0) {
          const roles = user.roles || [];
          const hasRole = roles.some((r: string) => allowed.includes(r));
          if (!hasRole) {
            this.loggerPort.warn(
              `AuthInsufficientPermissions: roles=${roles} no incluyen ${allowed}`,
              'GatewayService',
            );
            throw new Error('AuthInsufficientPermissions');
          }
        }

        enhancedHeaders = {
          ...enhancedHeaders,
          'x-user-id': user.id,
          'x-user-email': user.email,
          'x-user-role': (user.roles && user.roles[0]) || 'USER',
        };
      } else if (authDisabled) {
        this.loggerPort.warn('JWT validation disabled by configuration', 'GatewayService');
      }

      const targetUrl = this.getServiceUrl(serviceRoute);
      const finalUrl = request.getTargetUrl(targetUrl);

      this.loggerPort.log(
        `Routing request: ${request.method} ${request.url} -> ${serviceRoute} service -> ${finalUrl}`,
        'GatewayService',
      );

      const response = await this.gatewayPort.forwardRequest(
        request.method,
        finalUrl,
        enhancedHeaders,
        request.body,
      );

      const responseTime = Date.now() - startTime;
      this.loggerPort.logRequest(
        request.method,
        request.url,
        response.status || 200,
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

      const statusGuess =
        error.message.includes('AuthMissingToken') || error.message.includes('AuthInvalidToken')
          ? 401
          : error.message.includes('AuthInsufficientPermissions')
          ? 403
          : 500;

      this.loggerPort.logRequest(
        request.method,
        request.url,
        statusGuess,
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
      routes: process.env.ROUTES_SERVICE_URL || 'http://localhost:8000',
      narrator: process.env.PLACES_SERVICE_URL || 'http://localhost:3002',
    };

    return serviceUrls[serviceRoute];
  }
}