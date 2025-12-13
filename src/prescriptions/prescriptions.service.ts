import { Injectable, NotFoundException } from '@nestjs/common';
import moment from 'moment';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicationLogDto } from './dto/create-medication-log.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionEntity } from './entities/prescription.entity';

interface FindAllFilters {
  dependentId?: string;
  date?: string;
}

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePrescriptionDto) {
    const { schedules, ...data } = dto;

    return this.prisma.prescription.create({
      data: {
        ...data,
        schedules: {
          create: schedules.map((s) => ({ time: s.time })),
        },
      },
      include: {
        schedules: { orderBy: { time: 'asc' } },
        medication: true,
        dependent: true,
      },
    });
  }

  async remove(id: number) {
    const prescription = await this.find(id);

    await this.prisma.prescription.update({
      data: {
        isDeleted: true,
      },
      where: {
        id: prescription.id,
      },
    });

    return true;
  }

  async find(id: number) {
    const prescription = await this.prisma.prescription.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        medication: true,
        dependent: true,
        schedules: { orderBy: { time: 'asc' } },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return new PrescriptionEntity(prescription);
  }

  async update({
    filter,
    data,
  }: {
    filter: { id: number };
    data: UpdatePrescriptionDto;
  }) {
    const prescription = await this.find(filter.id);

    return this.prisma.prescription.update({
      data: {
        ...data,
        schedules: {
          create: data.schedules.map((s) => ({ time: s.time })),
        },
      },
      where: {
        id: prescription.id,
      },
    });
  }

  findAll(filters: FindAllFilters) {
    const where: {
      dependentId?: string;
      startDate?: { lte: Date };
      OR?: { endDate: null | { gte: Date } }[];
      isDeleted?: boolean;
    } = {
      isDeleted: false,
    };

    if (filters.dependentId) {
      where.dependentId = filters.dependentId;
    }

    if (filters.date) {
      const startOfDay = moment(filters.date).startOf('day').toDate();

      const endOfDay = moment(filters.date).endOf('day').toDate();

      where.startDate = { lte: endOfDay };
      where.OR = [{ endDate: null }, { endDate: { gte: startOfDay } }];
    }

    return this.prisma.prescription.findMany({
      where,
      include: {
        schedules: { orderBy: { time: 'asc' } },
        medication: true,
        dependent: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createMedicationLog(prescriptionId: number, dto: CreateMedicationLogDto) {
    return this.prisma.medicationLog.create({
      data: {
        prescriptionId,
        ...dto,
      },
      include: {
        prescription: {
          include: { medication: true },
        },
        caregiver: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
