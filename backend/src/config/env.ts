const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'GEMINI_API_KEY',
  'GROQ_API_KEY',
  'TAVILY_API_KEY',
] as const;

export function validateEnv(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

export const config = {
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  PORT: parseInt(process.env['PORT'] ?? '5000', 10),
  FRONTEND_URL: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',

  SUPABASE_URL: process.env['SUPABASE_URL'] as string,
  SUPABASE_ANON_KEY: process.env['SUPABASE_ANON_KEY'] as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'] as string,
  DATABASE_URL: process.env['DATABASE_URL'] as string,

  GOOGLE_CLIENT_ID: process.env['GOOGLE_CLIENT_ID'] as string,
  GOOGLE_CLIENT_SECRET: process.env['GOOGLE_CLIENT_SECRET'] as string,
  GOOGLE_CALLBACK_URL: process.env['GOOGLE_CALLBACK_URL'] as string,

  JWT_ACCESS_SECRET: process.env['JWT_ACCESS_SECRET'] as string,
  JWT_REFRESH_SECRET: process.env['JWT_REFRESH_SECRET'] as string,
  JWT_ACCESS_EXPIRY: process.env['JWT_ACCESS_EXPIRY'] ?? '15m',
  JWT_REFRESH_EXPIRY: process.env['JWT_REFRESH_EXPIRY'] ?? '7d',

  GEMINI_API_KEY: process.env['GEMINI_API_KEY'] as string,
  GROQ_API_KEY: process.env['GROQ_API_KEY'] as string,
  TAVILY_API_KEY: process.env['TAVILY_API_KEY'] as string,
} as const;