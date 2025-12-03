import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type { Algorithm } from 'jsonwebtoken';
import { AuthPort } from '../../domain/ports/auth.port';

@Injectable()
export class JwtAuthAdapter implements AuthPort {
  // Configuración de verificación JWT
  private readonly algorithmStr: string;
  private readonly jwtSecret: string | undefined;
  private readonly publicKey: string | undefined;
  private readonly issuer: string | undefined;
  private readonly audience: string | undefined;

  constructor() {
    // Permite HS256 (secreto compartido) o RS256 (clave pública)
    this.algorithmStr = (process.env.JWT_ALGORITHM || 'HS256').toUpperCase();
    this.jwtSecret = process.env.JWT_SECRET || undefined;
    this.publicKey = process.env.JWT_PUBLIC_KEY || undefined;
    this.issuer = process.env.JWT_ISSUER || undefined;
    this.audience = process.env.JWT_AUDIENCE || undefined;
  }

  /**
   * Valida la firma y vigencia del token según la configuración.
   * @param token JWT en formato Bearer (sin el prefijo)
   * @returns true si es válido; false en caso contrario
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const key = this.getVerificationKey();
      const alg = this.getAlgorithm();
      jwt.verify(token, key, {
        algorithms: [alg],
        issuer: this.issuer,
        audience: this.audience,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extrae datos mínimos del usuario desde el token ya verificado.
   * @param token JWT
   * @returns objeto con id, email y roles
   */
  async extractUserFromToken(token: string): Promise<any> {
    try {
      const key = this.getVerificationKey();
      const alg = this.getAlgorithm();
      const decoded = jwt.verify(token, key, {
        algorithms: [alg],
        issuer: this.issuer,
        audience: this.audience,
      }) as any;

      return {
        id: decoded.userId || decoded.sub || decoded.id,
        email: decoded.email,
        roles: decoded.roles || (decoded.role ? [decoded.role] : []),
      };
    } catch {
      throw new Error('Invalid token');
    }
  }

  private getVerificationKey(): string {
    if (this.algorithmStr === 'RS256') {
      if (!this.publicKey) {
        throw new Error('Missing JWT_PUBLIC_KEY for RS256 verification');
      }
      return this.publicKey;
    }
    // HS256 por defecto
    if (!this.jwtSecret) {
      throw new Error('Missing JWT_SECRET for HS256 verification');
    }
    return this.jwtSecret;
  }

  private getAlgorithm(): Algorithm {
    // Solo soportamos HS256 y RS256 por ahora
    return this.algorithmStr === 'RS256' ? 'RS256' : 'HS256';
  }
}