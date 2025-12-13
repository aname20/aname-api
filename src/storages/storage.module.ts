import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './services/storage.service';
import { StorageController } from './controllers/storage.controller';

@Global()
@Module({
  controllers: [StorageController],
  providers: [ConfigService, StorageService],
  exports: [StorageService],
})
export class StorageModule {}
