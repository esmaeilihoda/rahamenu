import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Ensure .env is loaded regardless of import order
const envPathPrimary = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPathPrimary });
dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Support DATABASE_URL (preferred) or legacy MONGODB_URI
  DATABASE_URL: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().url('Client URL must be a valid URL'),
  SOCKET_CORS_ORIGIN: z.string().url('Socket CORS origin must be a valid URL'),
  // Payment gateway (Zarrinpal)
  ZARRINPAL_MERCHANT_ID: z.string().min(10, 'Zarrinpal merchant ID is required'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  try {
    const raw = envSchema.parse(process.env);
    // Normalize DB URL: prefer DATABASE_URL, fallback to MONGODB_URI
    const dbUrl = raw.DATABASE_URL || raw.MONGODB_URI;
    if (!dbUrl) {
      throw new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message: 'DATABASE_URL (preferred) or MONGODB_URI must be set',
        },
      ]);
    }

    const env: EnvConfig = {
      ...raw,
      // Ensure MONGODB_URI is set for consumers like database.ts
      MONGODB_URI: dbUrl,
    } as EnvConfig;

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const env = validateEnv();
