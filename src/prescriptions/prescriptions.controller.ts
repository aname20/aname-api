import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { CreateMedicationLogDto } from './dto/create-medication-log.dto';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(dto);
  }

  @Get()
  findAll(
    @Query('dependentId') dependentId?: string,
    @Query('date') date?: string,
  ) {
    return this.prescriptionsService.findAll({ dependentId, date });
  }

  @Post(':id/log')
  createMedicationLog(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMedicationLogDto,
  ) {
    return this.prescriptionsService.createMedicationLog(id, dto);
  }
}
