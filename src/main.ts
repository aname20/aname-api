import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ZodValidationPipe } from 'nestjs-zod';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ZodValidationPipe());
  app.setGlobalPrefix('api');

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Get allowed origins from environment variable
      const allowedOrigins = process.env.ANAME_FRONTEND_URL 
        ? process.env.ANAME_FRONTEND_URL.split(',').map(o => o.trim())
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
          ];

      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  };

  app.enableCors(corsOptions);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
