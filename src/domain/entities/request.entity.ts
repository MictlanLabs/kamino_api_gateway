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
    const match = this.url.match(/^\/api(?:\/(v\d+))?\/([^\/\?\#]+)/);
    if (!match) {
      throw new Error(`Unknown service route for URL: ${this.url}`);
    }

    const serviceSegment = match[2];

    if (serviceSegment === 'auth' || serviceSegment === 'users') return 'users';
    if (serviceSegment === 'places') return 'places';
    if (serviceSegment === 'routes') return 'routes';
    if (serviceSegment === 'recommender') return 'recommender';
    if (serviceSegment === 'narrator') return 'narrator';
    if (serviceSegment === 'chat') return 'places';      
    if (serviceSegment === 'gemini') return 'places'; 
    throw new Error(`Unknown service route for URL: ${this.url}`);
  }

  getTargetUrl(baseUrl: string): string {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

    const match = this.url.match(/^\/api(?:\/(v\d+))?\/([^\/\?\#]+)(.*)$/);
    if (!match) {
      throw new Error(`Unknown service route for URL: ${this.url}`);
    }

    const incomingVersion = match[1] || null;
    const serviceSegment = match[2];
    const remainder = match[3] || '';

    const serviceKey = this.getServiceRoute(); // users | places | routes | narrator

    const envKey = `${serviceKey.toUpperCase()}_SERVICE_BASE_PATH`;
    const defaultBase = serviceKey === 'users' || serviceKey === 'recommender' ? '/api' : '';
    let basePath = (process.env[envKey] as string | undefined) ?? defaultBase;

    // Si el cliente envió versión explícita (/api/v1), respetarla
    if (incomingVersion) {
      basePath = `/api/${incomingVersion}`;
    }

    const normalizedBasePath =
      basePath ? `/${basePath.replace(/^\/+/, '').replace(/\/+$/, '')}` : '';

    return `${normalizedBaseUrl}${normalizedBasePath}/${serviceSegment}${remainder}`;
  }
}