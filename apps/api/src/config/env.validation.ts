import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  API_PORT: Joi.number().default(3001),
  API_HOST: Joi.string().default('0.0.0.0'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  BCRYPT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
  CORS_ORIGIN: Joi.string().uri().default('http://localhost:3000'),
  RATE_LIMIT_TTL: Joi.number().integer().default(60),
  RATE_LIMIT_MAX: Joi.number().integer().default(100),
});
