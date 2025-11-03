export class RequestEntity {
  constructor(
    public readonly method: string,
    public readonly url: string,
    public readonly headers: Record<string, string>,
    public readonly body?: any,
    public readonly timestamp: Date = new Date(),
    public readonly ip?: string,
    public readonly userAgent?: string,
  ) {}

  getServiceRoute(): string {
    if (this.url.startsWith('/api/auth')) return 'users';
    if (this.url.startsWith('/api/users')) return 'users';
    if (this.url.startsWith('/api/places')) return 'places';
    if (this.url.startsWith('/api/routes')) return 'routes';
    if (this.url.startsWith('/api/narrator')) return 'narrator';
    throw new Error(`Unknown service route for URL: ${this.url}`);
  }

  getTargetUrl(baseUrl: string): string {
    // Para el microservicio de usuarios, mantener la ruta completa
    if (this.url.startsWith('/api/auth') || this.url.startsWith('/api/users')) {
      return `${baseUrl}${this.url}`;
    }
    
    // Para otros servicios, remover el prefijo /api/[service]
    const servicePath = this.url.replace(/^\/api\/[^\/]+/, '');
    return `${baseUrl}${servicePath}`;
  }
}