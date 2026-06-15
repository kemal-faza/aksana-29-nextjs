import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';

let cachedApp: any;

export async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(express()),
      { logger: ['error', 'warn'] },
    );
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    });
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  app.getHttpAdapter().getInstance()(req, res);
}
