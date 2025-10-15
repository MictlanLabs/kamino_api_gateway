export interface AuthPort {
  validateToken(token: string): Promise<boolean>;
  extractUserFromToken(token: string): Promise<any>;
}