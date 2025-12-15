import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

import { DependentsModule } from './dependents/dependents.module';
import { DocumentsModule } from './documents/documents.module';
import { EventsModule } from './events/events.module';
import { MedicationsModule } from './medications/medications.module';
import { PrismaService } from './prisma/prisma.service';
import { StorageModule } from './storages/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    PrescriptionsModule,
    DependentsModule,
    DocumentsModule,
    EventsModule,
    StorageModule,
    MedicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
