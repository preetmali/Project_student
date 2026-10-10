import { config } from 'dotenv';

config();

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  ENABLE_MOCK_AUTH: process.env.ENABLE_MOCK_AUTH !== 'false',
};

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[ProjectHub] WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Using memory DB/Mock mode for development if DB_URL is not set.'
  );
}
