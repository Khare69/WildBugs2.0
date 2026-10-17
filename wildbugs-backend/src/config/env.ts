import dotenv from 'dotenv';
import { z } from 'zod';

// Load variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('3001')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val < 65536, {
      message: 'PORT must be a valid port number between 1 and 65535',
    }),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z
    .string({
      required_error: 'DATABASE_URL is required to connect to PostgreSQL with PostGIS',
    })
    .min(1, 'DATABASE_URL cannot be empty'),
  JWT_SECRET: z
    .string({
      required_error: 'JWT_SECRET is required to sign and verify user authentication tokens',
    })
    .min(16, 'JWT_SECRET must be at least 16 characters long for cryptographic security'),
  JWT_EXPIRES_IN: z
    .string()
    .default('7d'),
  CORS_ORIGIN: z
    .string()
    .default('*'),
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .optional()
    .default(''),
  CLOUDINARY_API_KEY: z
    .string()
    .optional()
    .default(''),
  CLOUDINARY_API_SECRET: z
    .string()
    .optional()
    .default(''),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid or missing environment configuration:');
    const formattedErrors = result.error.format();
    
    Object.entries(formattedErrors).forEach(([key, value]) => {
      if (key !== '_errors' && value && '_errors' in value && (value._errors as string[]).length > 0) {
        console.error(`  - ${key}: ${(value._errors as string[]).join(', ')}`);
      }
    });

    throw new Error(
      `[Config Error] Environment variable validation failed. Please check your .env configuration.`
    );
  }

  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
export default env;
