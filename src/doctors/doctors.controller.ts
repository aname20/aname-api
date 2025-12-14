import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Controller('doctors')
@UsePipes(ZodValidationPipe)
export class DoctorsController {
    constructor(private readonly doctorsService: DoctorsService) { }

    @Post()
    create(@Body() createDoctorDto: CreateDoctorDto) {
        return this.doctorsService.create(createDoctorDto);
    }

    @Get()
    findAll(@Query('search') search?: string) {
        return this.doctorsService.findAll(search);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.doctorsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDoctorDto: UpdateDoctorDto,
    ) {
        return this.doctorsService.update(id, updateDoctorDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.doctorsService.remove(id);
    }
}
