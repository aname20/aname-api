import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('documents')
@UsePipes(ZodValidationPipe)
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @CurrentUser() user: any,
  ) {
    const userId = user.sub || user.id;
    return this.documentsService.create(createDocumentDto, userId);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('dependentId') dependentId?: string,
  ) {
    const userId = user.sub || user.id;
    return this.documentsService.findAll(userId, dependentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const userId = user.sub || user.id;
    return this.documentsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @CurrentUser() user: any,
  ) {
    const userId = user.sub || user.id;
    return this.documentsService.update(id, updateDocumentDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const userId = user.sub || user.id;
    return this.documentsService.remove(id, userId);
  }
}

