import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { GatewayPort } from '../../domain/ports/gateway.port';

@Injectable()
export class HttpGatewayAdapter implements GatewayPort {
  async forwardRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: any,
  ): Promise<any> {
    try {
      // Remover headers que no deben ser reenviados
      const cleanHeaders = { ...headers };
      delete cleanHeaders.host;
      delete cleanHeaders['content-length'];

      const response: AxiosResponse = await axios({
        method: method.toLowerCase() as any,
        url,
        headers: cleanHeaders,
        data: body,
        timeout: 30000, // 30 segundos de timeout
        validateStatus: () => true, // Aceptar todos los códigos de estado
      });

      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Service unavailable: ${url}`);
      }
      if (error.code === 'ETIMEDOUT') {
        throw new Error(`Service timeout: ${url}`);
      }
      throw new Error(`Gateway error: ${error.message}`);
    }
  }
}