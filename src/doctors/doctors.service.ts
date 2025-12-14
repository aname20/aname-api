import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDoctorDto: CreateDoctorDto) {
        return await this.prisma.doctor.create({
            data: createDoctorDto,
        });
    }

    async findAll(search?: string) {
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { specialty: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        return await this.prisma.doctor.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: number) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id },
            include: {
                events: {
                    include: {
                        dependent: {
                            select: { name: true },
                        },
                    },
                    orderBy: { date: 'desc' },
                },
            },
        });

        if (!doctor) {
            throw new NotFoundException('Médico não encontrado');
        }

        return doctor;
    }

    async update(id: number, updateDoctorDto: UpdateDoctorDto) {
        // Check if doctor exists
        await this.findOne(id);

        return await this.prisma.doctor.update({
            where: { id },
            data: updateDoctorDto,
        });
    }

    async remove(id: number) {
        // Check if doctor exists
        await this.findOne(id);

        return await this.prisma.doctor.delete({
            where: { id },
        });
    }
}
