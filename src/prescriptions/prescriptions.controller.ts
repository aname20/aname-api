import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateMedicationLogDto } from './dto/create-medication-log.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionsService } from './prescriptions.service';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(dto);
  }

  @Get(':id')
  find(@Param('id', ParseIntPipe) id: number) {
    return this.prescriptionsService.find(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.prescriptionsService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePrescriptionDto,
  ) {
    const options = {
      filter: { id },
      data: dto,
    };

    return this.prescriptionsService.update(options);
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
