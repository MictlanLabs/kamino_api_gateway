import {
  Controller,
  All,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GatewayService } from '../../domain/services/gateway.service';
import { RequestEntity } from '../../domain/entities/request.entity';

@Controller('api')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All('*')
  async handleRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const requestEntity = new RequestEntity(
        req.method,
        req.url,
        req.headers as Record<string, string>,
        req.body,
        new Date(),
        req.ip,
        req.get('User-Agent'),
      );

      const response = await this.gatewayService.processRequest(requestEntity);

      // Configurar headers de respuesta
      if (response.headers) {
        Object.keys(response.headers).forEach((key) => {
          // Evitar headers que pueden causar problemas
          if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
            res.set(key, response.headers[key]);
          }
        });
      }

      res.status(response.status || 200).json(response.data);
    } catch (error) {
      if (error.message.includes('AuthMissingToken')) {
        throw new HttpException('Unauthorized: missing token', HttpStatus.UNAUTHORIZED);
      }
      if (error.message.includes('AuthInvalidToken')) {
        throw new HttpException('Unauthorized: invalid token', HttpStatus.UNAUTHORIZED);
      }
      if (error.message.includes('AuthInsufficientPermissions')) {
        throw new HttpException('Forbidden: insufficient permissions', HttpStatus.FORBIDDEN);
      }
      if (error.message.includes('Service unavailable')) {
        throw new HttpException('Service Unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }
      if (error.message.includes('Service timeout')) {
        throw new HttpException('Gateway Timeout', HttpStatus.GATEWAY_TIMEOUT);
      }
      if (error.message.includes('Unknown service route')) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}