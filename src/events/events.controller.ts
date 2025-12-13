import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UsePipes,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
@UsePipes(ZodValidationPipe)
@UseGuards(JwtAuthGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    create(
        @Body() createEventDto: CreateEventDto,
        @CurrentUser() user: any,
    ) {
        const userId = user.sub || user.id;
        return this.eventsService.create(createEventDto, userId);
    }

    @Get()
    findAll(
        @CurrentUser() user: any,
        @Query('dependentId') dependentId?: string,
    ) {
        const userId = user.sub || user.id;
        return this.eventsService.findAll(userId, dependentId);
    }

    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
    ) {
        const userId = user.sub || user.id;
        return this.eventsService.findOne(id, userId);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEventDto: UpdateEventDto,
        @CurrentUser() user: any,
    ) {
        const userId = user.sub || user.id;
        return this.eventsService.update(id, updateEventDto, userId);
    }

    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
    ) {
        const userId = user.sub || user.id;
        return this.eventsService.remove(id, userId);
    }
}
