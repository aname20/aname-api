import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { DependentsService } from './dependents.service';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdateDependentDto } from './dto/update-dependent.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AddCaregiverDto } from './dto/add-caregiver.dto';

@Controller('dependents')
@UsePipes(ZodValidationPipe)
@UseGuards(JwtAuthGuard) // Todas as rotas exigem login
export class DependentsController {
  constructor(private readonly dependentsService: DependentsService) {}

  @Post()
  create(
    @Body() createDependentDto: CreateDependentDto,
    @CurrentUser() user: any,
  ) {
    const userId = user.sub || user.id;
    return this.dependentsService.create(createDependentDto, userId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    const userId = user.sub || user.id;
    return this.dependentsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dependentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDependentDto: UpdateDependentDto,
    @CurrentUser() user: any,
  ) {
    const userId = user.sub || user.id;
    return this.dependentsService.update(id, updateDependentDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const userId = user.sub || user.id;
    return this.dependentsService.remove(id, userId);
  }

  @Post(':id/caregivers')
  addCaregiver(
    @Param('id') id: string,
    @Body() addCaregiverDto: AddCaregiverDto,
    @CurrentUser() user: any,
  ) {
    const requesterId = user.sub || user.id;
    return this.dependentsService.addCaregiver(
      id,
      addCaregiverDto.email,
      requesterId,
    );
  }

  @Delete(':id/caregivers/:caregiverId')
  removeCaregiver(
    @Param('id') dependentId: string,
    @Param('caregiverId') caregiverIdToRemove: string,
    @CurrentUser() user: any,
  ) {
    const requesterId = user.sub || user.id;
    return this.dependentsService.removeCaregiver(
      dependentId,
      caregiverIdToRemove,
      requesterId,
    );
  }

  @Get(':id/caregivers')
  listCaregivers(@Param('id') id: string) {
    return this.dependentsService.getCaregivers(id);
  }
}
