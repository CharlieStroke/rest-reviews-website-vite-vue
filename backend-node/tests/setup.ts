// Provide minimal env vars so env.config.ts doesn't call process.exit in unit tests
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-for-unit-tests';
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://test.supabase.co';
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY ?? 'test-key';
