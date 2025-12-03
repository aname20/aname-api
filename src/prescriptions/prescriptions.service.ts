import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { CreateMedicationLogDto } from './dto/create-medication-log.dto';

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

  findAll(filters: FindAllFilters) {
    const where: {
      dependentId?: string;
      startDate?: { lte: Date };
      OR?: { endDate: null | { gte: Date } }[];
    } = {};

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
