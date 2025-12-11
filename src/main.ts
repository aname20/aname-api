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
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
        return;
      }

      callback(null, true);
    },
    credentials: true,
  };

  app.enableCors(corsOptions);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
