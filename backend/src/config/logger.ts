import winston from 'winston';
import morgan from 'morgan';
import { env } from './env';

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

// ─── Custom Log Format ────────────────────────────────────────────────────────
const devFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

// ─── Winston Logger ───────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    env.NODE_ENV === 'production'
      ? json()
      : combine(colorize(), devFormat)
  ),
  transports: [
    new winston.transports.Console(),
    ...(env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
  exitOnError: false,
});

// ─── Morgan HTTP Logger ───────────────────────────────────────────────────────
const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export const httpLogger = morgan(
  env.NODE_ENV === 'production' ? 'combined' : 'dev',
  { stream: morganStream }
);
