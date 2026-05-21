import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  // MongoDB
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Frontend URL (CORS)
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // Backend public origin (used to build URLs for files served from /uploads)
  BACKEND_URL: z.string().url().default('http://localhost:5000'),

  // Cloudflare R2 (optional — when all five are set, R2 is primary with local
  // /uploads as automatic runtime fallback. When any is blank, local-only.)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional().or(z.literal('').transform(() => undefined)),

  // Email (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('Sai Physiotherapy <clinic@saiphysiotherapy.com>'),

  // SMS (MSG91)
  SMS_PROVIDER: z.enum(['msg91', 'twilio', 'none']).default('none'),
  MSG91_API_KEY: z.string().optional(),
  MSG91_SENDER_ID: z.string().default('SAIPHYS'),

  // WhatsApp (WATI)
  WHATSAPP_API_URL: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),

  // Redis (optional)
  REDIS_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
