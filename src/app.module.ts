import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';

import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [UsersModule, PrismaModule, PrescriptionsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
