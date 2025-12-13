import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { MedicationByCaregiverResponseDto } from './dto/medication-by-caregiver-response.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class MedicationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMedicationDto) {
    return this.prisma.medication.create({
      data: dto,
    });
  }

  async findAll(pagination: PaginationDto = new PaginationDto()) {
    const [medications, total] = await Promise.all([
      this.prisma.medication.findMany({
        orderBy: {
          name: 'asc',
        },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.medication.count(),
    ]);

    return new PaginatedResponseDto(
      medications,
      total,
      pagination.page,
      pagination.limit,
    );
  }

  async findAllByCaregiver(
    caregiverId: string,
    pagination: PaginationDto = new PaginationDto(),
  ): Promise<PaginatedResponseDto<MedicationByCaregiverResponseDto>> {
    const total = await this.prisma.prescription.count({
      where: {
        dependent: {
          caregivers: {
            some: {
              caregiverId: caregiverId,
            },
          },
        },
      },
    });

    const medications = await this.prisma.medication.findMany({
      where: {
        prescriptions: {
          some: {
            dependent: {
              caregivers: {
                some: {
                  caregiverId: caregiverId,
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        prescriptions: {
          where: {
            dependent: {
              caregivers: {
                some: {
                  caregiverId: caregiverId,
                },
              },
            },
          },
          include: {
            dependent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip: pagination.skip,
          take: pagination.limit,
        },
      },
    });

    const result = medications.flatMap((medication) =>
      medication.prescriptions.map(
        (prescription) =>
          new MedicationByCaregiverResponseDto(medication, prescription),
      ),
    );

    return new PaginatedResponseDto(
      result,
      total,
      pagination.page,
      pagination.limit,
    );
  }

  findOne(id: number) {
    return this.prisma.medication.findUnique({
      where: { id },
      include: {
        prescriptions: true,
      },
    });
  }

  update(id: number, dto: UpdateMedicationDto) {
    return this.prisma.medication.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.medication.delete({
      where: { id },
    });
  }
}
