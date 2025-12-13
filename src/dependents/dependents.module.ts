import { Module } from '@nestjs/common';
import { DependentsService } from './dependents.service';
import { DependentsController } from './dependents.controller';
import { PrismaModule } from 'src/prisma/prisma.module'; // Importe o PrismaModule

@Module({
  imports: [PrismaModule], // Necessário para usar o PrismaService
  controllers: [DependentsController],
  providers: [DependentsService],
})
export class DependentsModule {}
