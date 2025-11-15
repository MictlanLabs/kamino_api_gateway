describe('CORS configuration (logic)', () => {
  const normalizeOrigin = (v?: string) => (v ? v.replace(/^(["'`\s]+)|(["'`\s]+)$/g, '') : '');
  const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

  it('allows localhost origin', () => {
    const origin = 'http://localhost:3000';
    const envList = (process.env.CORS_ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => normalizeOrigin(s))
      .filter((s) => !!s);
    const flutter = normalizeOrigin('https://flutter.example.com');
    const allowedOrigins = new Set<string>([...envList, ...(flutter ? [flutter] : [])]);
    const allowed = !origin || allowedOrigins.has(origin) || localhostRegex.test(origin);
    expect(allowed).toBe(true);
  });

  it('allows configured Flutter origin', () => {
    const origin = 'https://flutter.example.com';
    const envList = (process.env.CORS_ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => normalizeOrigin(s))
      .filter((s) => !!s);
    const flutter = normalizeOrigin('https://flutter.example.com');
    const allowedOrigins = new Set<string>([...envList, ...(flutter ? [flutter] : [])]);
    const allowed = !origin || allowedOrigins.has(origin) || localhostRegex.test(origin);
    expect(allowed).toBe(true);
  });

  it('blocks unknown external origin', () => {
    const origin = 'https://evil.com';
    const envList = (process.env.CORS_ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => normalizeOrigin(s))
      .filter((s) => !!s);
    const flutter = normalizeOrigin('https://flutter.example.com');
    const allowedOrigins = new Set<string>([...envList, ...(flutter ? [flutter] : [])]);
    const allowed = !origin || allowedOrigins.has(origin) || localhostRegex.test(origin);
    expect(allowed).toBe(false);
  });
});