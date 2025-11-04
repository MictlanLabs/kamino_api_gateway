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

  getTargetUrl(baseUrl: string, serviceBasePath: string = ''): string {
    // Remover el prefijo /api/[service] para obtener el path real
    const servicePath = this.url.replace(/^\/api\/[^\/]+/, '');
    
    // Para el servicio de usuarios, mantener la ruta completa si es /api/auth
    if (this.url.startsWith('/api/auth')) {
      return `${baseUrl}${this.url}`;
    }
    
    // Construir la URL final combinando baseUrl + serviceBasePath + servicePath
    // Eliminar barras duplicadas
    let finalPath = serviceBasePath + servicePath;
    finalPath = finalPath.replace(/\/+/g, '/'); // Reemplazar múltiples barras con una sola
    
    return `${baseUrl}${finalPath}`;
  }
}