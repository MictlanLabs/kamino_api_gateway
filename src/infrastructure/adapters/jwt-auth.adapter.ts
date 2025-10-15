import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthPort } from '../../domain/ports/auth.port';

@Injectable()
export class JwtAuthAdapter implements AuthPort {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      jwt.verify(token, this.jwtSecret);
      return true;
    } catch (error) {
      return false;
    }
  }

  async extractUserFromToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        roles: decoded.roles || [],
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}