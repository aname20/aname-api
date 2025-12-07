import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdateDependentDto } from './dto/update-dependent.dto';

@Injectable()
export class DependentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um dependente e vincula automaticamente ao usuário que criou (como Cuidador)
   */
  async create(createDependentDto: CreateDependentDto, userId: string) {
    return await this.prisma.dependent.create({
      data: {
        ...createDependentDto,
        caregivers: {
          create: {
            caregiverId: userId,
          },
        },
      },
      include: {
        caregivers: true,
      },
    });
  }

  async findAll(userId: string) {
    return await this.prisma.dependent.findMany({
      where: {
        caregivers: {
          some: {
            caregiverId: userId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Busca um dependente trazendo TUDO relacionado a ele (ficha completa)
   */
  async findOne(id: string) {
    return await this.prisma.dependent.findUnique({
      where: { id },
      include: {
        caregivers: { include: { caregiver: true } },
        familyMembers: { include: { family: true } },
        conditions: { include: { condition: true } },
        allergies: { include: { allergy: true } },
        emergencyContacts: true,
        events: true,
        documents: true,
      },
    });
  }

  async update(id: string, updateDependentDto: UpdateDependentDto) {
    return await this.prisma.dependent.update({
      where: { id },
      data: updateDependentDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.dependent.delete({
      where: { id },
    });
  }

  /**
   * Adiciona um novo cuidador pelo EMAIL
   */
  async addCaregiver(dependentId: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Usuário não encontrado com este email.');
    }

    const existingLink = await this.prisma.dependentCaregiver.findUnique({
      where: {
        caregiverId_dependentId: {
          caregiverId: user.id,
          dependentId,
        },
      },
    });

    if (existingLink) {
      throw new Error('Este usuário já é cuidador deste dependente.');
    }

    return await this.prisma.dependentCaregiver.create({
      data: {
        dependentId,
        caregiverId: user.id,
      },
      include: {
        caregiver: true,
      },
    });
  }

  /**
   * Remove um cuidador específico
   */
  async removeCaregiver(dependentId: string, caregiverId: string) {
    try {
      return await this.prisma.dependentCaregiver.delete({
        where: {
          caregiverId_dependentId: {
            caregiverId,
            dependentId,
          },
        },
      });
    } catch (error) {
      throw new Error('Cuidador não encontrado para este dependente.');
    }
  }

  /**
   * Lista todos os cuidadores de um dependente
   */
  async getCaregivers(dependentId: string) {
    const dependent = await this.prisma.dependent.findUnique({
      where: { id: dependentId },
      include: {
        caregivers: {
          include: {
            caregiver: {
              select: { id: true, name: true, email: true, phone: true }, // Só dados seguros
            },
          },
        },
      },
    });

    if (!dependent) return [];
    return dependent.caregivers.map((relation) => relation.caregiver);
  }
}
