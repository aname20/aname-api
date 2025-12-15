import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to verify if the user has access to the dependent.
   * Checks both DependentFamily and DependentCaregiver relationships.
   */
  private async validatePermission(dependentId: string, userId: string) {
    const hasAccess = await this.prisma.dependent.findFirst({
      where: {
        id: dependentId,
        OR: [
          { familyMembers: { some: { familyId: userId } } },
          { caregivers: { some: { caregiverId: userId } } },
        ],
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have permission to access events for this dependent.',
      );
    }
  }

  async create(createEventDto: CreateEventDto, userId: string) {
    await this.validatePermission(createEventDto.dependentId, userId);

    return await this.prisma.event.create({
      data: createEventDto,
      include: {
        dependent: { select: { name: true } },
      },
    });
  }

  async findAll(userId: string, dependentId?: string) {
    // If dependentId is provided, check permission for that specific dependent
    if (dependentId) {
      await this.validatePermission(dependentId, userId);
      return await this.prisma.event.findMany({
        where: { dependentId },
        orderBy: { date: 'asc' },
        include: {
          dependent: { select: { name: true } },
        },
      });
    }

    // If no dependentId, return all events from all dependents the user has access to
    return await this.prisma.event.findMany({
      where: {
        dependent: {
          OR: [
            { familyMembers: { some: { familyId: userId } } },
            { caregivers: { some: { caregiverId: userId } } },
          ],
        },
      },
      orderBy: { date: 'asc' },
      include: {
        dependent: { select: { name: true } },
      },
    });
  }

  async findOne(id: number, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    // Reuse the permission check
    await this.validatePermission(event.dependentId, userId);

    return await this.prisma.event.findUnique({
      where: { id },
      include: {
        dependent: { select: { name: true } },
      },
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto, userId: string) {
    // First, find the event to check existing dependent permission
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found.');
    }

    await this.validatePermission(existingEvent.dependentId, userId);

    // If updating dependentId, check permission for the new dependent as well
    if (
      updateEventDto.dependentId &&
      updateEventDto.dependentId !== existingEvent.dependentId
    ) {
      await this.validatePermission(updateEventDto.dependentId, userId);
    }

    return await this.prisma.event.update({
      where: { id },
      data: updateEventDto,
      include: {
        dependent: { select: { name: true } },
      },
    });
  }

  async remove(id: number, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    await this.validatePermission(event.dependentId, userId);

    return await this.prisma.event.delete({
      where: { id },
    });
  }
}
