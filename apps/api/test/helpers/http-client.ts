import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

type HttpServer = Parameters<typeof request>[0];

export function apiRequest(app: INestApplication): ReturnType<typeof request> {
  const server = app.getHttpServer() as HttpServer;
  return request(server);
}

export function responseBody<T>(response: { body: unknown }): T {
  return response.body as T;
}
