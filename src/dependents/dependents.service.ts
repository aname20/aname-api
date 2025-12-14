import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdateDependentDto } from './dto/update-dependent.dto';

@Injectable()
export class DependentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDependentDto, userId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const dependent = await tx.dependent.create({
        data: {
          name: data.name,
          age: data.age,
          susCode: data.susCode,
          familyMembers: {
            create: { familyId: userId },
          },
        },
      });

      await this.upsertConditions(tx, dependent.id, data.conditions ?? []);
      await this.upsertAllergies(tx, dependent.id, data.allergies ?? []);
      await this.upsertCaregivers(tx, dependent.id, data.caregiverIds ?? []);
      await this.upsertEmergencyContacts(
        tx,
        dependent.id,
        data.emergencyContacts ?? [],
      );

      return this.findOneFormatted(tx, dependent.id);
    });
  }

  async findAll(userId: string) {
    const dependents = await this.prisma.dependent.findMany({
      where: {
        OR: [
          { caregivers: { some: { caregiverId: userId } } },
          { familyMembers: { some: { familyId: userId } } },
        ],
      },
      include: {
        conditions: { include: { condition: true } },
        allergies: { include: { allergy: true } },
        emergencyContacts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dependents.length === 0) {
      return [];
    }

    return dependents.map((dependent) => {
      return {
        id: dependent.id,
        name: dependent.name,
        age: dependent.age,
        susCode: dependent.susCode,
        conditions: dependent.conditions.map(
          (relation) => relation.condition.name,
        ),
        allergies: dependent.allergies.map((relation) => relation.allergy.name),
        createdAt: dependent.createdAt,
        emergencyContact: this.getEmergencyContact(dependent),
      };
    });
  }

  private getEmergencyContact(dependent: any) {
    const emergencyContacts = dependent?.emergencyContacts || [];

    if (emergencyContacts.length === 0) {
      return null;
    }

    const firstEmergencyContact = emergencyContacts[0];

    return firstEmergencyContact.phone;
  }

  async findOne(id: string) {
    return this.findOneFormatted(this.prisma, id);
  }

  async update(id: string, data: UpdateDependentDto, userId: string) {
    await this.validateEditPermission(id, userId);

    return await this.prisma.$transaction(async (tx) => {
      await this.updateBasicData(tx, id, data);

      if (data.conditions) {
        await this.upsertConditions(tx, id, data.conditions);
      }

      if (data.allergies) {
        await this.upsertAllergies(tx, id, data.allergies);
      }

      if (data.caregiverIds) {
        await this.validateFamilyPermission(tx, id, userId);
        await this.upsertCaregivers(tx, id, data.caregiverIds);
      }

      if (data.emergencyContacts) {
        await this.upsertEmergencyContacts(tx, id, data.emergencyContacts);
      }

      return this.findOneFormatted(tx, id);
    });
  }

  async remove(id: string, userId: string) {
    await this.validateFamilyPermission(this.prisma, id, userId);

    return await this.prisma.$transaction(async (tx) => {
      await tx.dependentCaregiver.deleteMany({
        where: { dependentId: id },
      });

      await tx.dependentFamily.deleteMany({
        where: { dependentId: id },
      });

      return await tx.dependent.delete({
        where: { id },
      });
    });
  }

  async addCaregiver(dependentId: string, email: string, requesterId: string) {
    await this.validateFamilyPermission(this.prisma, dependentId, requesterId);

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
        caregiver: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async removeCaregiver(
    dependentId: string,
    caregiverIdToRemove: string,
    requesterId: string,
  ) {
    await this.validateFamilyPermission(this.prisma, dependentId, requesterId);

    try {
      return await this.prisma.dependentCaregiver.delete({
        where: {
          caregiverId_dependentId: {
            caregiverId: caregiverIdToRemove,
            dependentId,
          },
        },
      });
    } catch {
      throw new Error('Cuidador não encontrado para este dependente.');
    }
  }

  async getCaregivers(dependentId: string) {
    const dependent = await this.prisma.dependent.findUnique({
      where: { id: dependentId },
      include: {
        caregivers: {
          include: {
            caregiver: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
      },
    });

    if (!dependent) {
      return [];
    }

    return dependent.caregivers.map((relation) => relation.caregiver);
  }

  private async validateEditPermission(
    dependentId: string,
    userId: string,
  ): Promise<void> {
    const hasPermission = await this.prisma.dependent.findFirst({
      where: {
        id: dependentId,
        OR: [
          { familyMembers: { some: { familyId: userId } } },
          { caregivers: { some: { caregiverId: userId } } },
        ],
      },
    });

    if (!hasPermission) {
      throw new Error(
        'Acesso negado: Você não tem permissão para editar este dependente.',
      );
    }
  }

  private async validateFamilyPermission(
    tx: any,
    dependentId: string,
    userId: string,
  ): Promise<void> {
    const isFamily = await tx.dependentFamily.findUnique({
      where: {
        familyId_dependentId: {
          familyId: userId,
          dependentId,
        },
      },
    });

    if (!isFamily) {
      throw new Error('Acesso negado: Apenas familiares podem fazer isso.');
    }
  }

  // ============================================

  private async updateBasicData(
    tx: any,
    dependentId: string,
    data: UpdateDependentDto,
  ): Promise<void> {
    const updateData: { name?: string; age?: number; susCode?: string } = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.age !== undefined) {
      updateData.age = data.age;
    }

    if (data.susCode !== undefined) {
      updateData.susCode = data.susCode;
    }

    if (Object.keys(updateData).length > 0) {
      await tx.dependent.update({
        where: { id: dependentId },
        data: updateData,
      });
    }
  }

  private async upsertConditions(
    tx: any,
    dependentId: string,
    conditionNames: string[],
  ): Promise<void> {
    await tx.dependentCondition.deleteMany({
      where: { dependentId },
    });

    for (const conditionName of conditionNames) {
      const conditionId = await this.findOrCreateCondition(tx, conditionName);

      await tx.dependentCondition.create({
        data: {
          dependentId,
          conditionId,
        },
      });
    }
  }

  private async upsertAllergies(
    tx: any,
    dependentId: string,
    allergyNames: string[],
  ): Promise<void> {
    await tx.dependentAllergy.deleteMany({
      where: { dependentId },
    });

    for (const allergyName of allergyNames) {
      const allergyId = await this.findOrCreateAllergy(tx, allergyName);

      await tx.dependentAllergy.create({
        data: {
          dependentId,
          allergyId,
        },
      });
    }
  }

  private async upsertCaregivers(
    tx: any,
    dependentId: string,
    caregiverIds: string[],
  ): Promise<void> {
    await tx.dependentCaregiver.deleteMany({
      where: { dependentId },
    });

    for (const caregiverId of caregiverIds) {
      await tx.dependentCaregiver.create({
        data: {
          dependentId,
          caregiverId,
        },
      });
    }
  }

  private async upsertEmergencyContacts(
    tx: any,
    dependentId: string,
    contacts: Array<{ name: string; phone: string; kinship?: string }>,
  ): Promise<void> {
    await tx.emergencyContact.deleteMany({
      where: { dependentId },
    });

    for (const contact of contacts) {
      await tx.emergencyContact.create({
        data: {
          name: contact.name,
          phone: contact.phone,
          kinship: contact.kinship,
          dependentId,
        },
      });
    }
  }

  private async findOrCreateCondition(
    tx: any,
    conditionName: string,
  ): Promise<number> {
    const existingCondition = await tx.healthCondition.findFirst({
      where: { name: { equals: conditionName, mode: 'insensitive' } },
    });

    if (existingCondition) {
      return existingCondition.id;
    }

    const newCondition = await tx.healthCondition.create({
      data: { name: conditionName },
    });

    return newCondition.id;
  }

  private async findOrCreateAllergy(
    tx: any,
    allergyName: string,
  ): Promise<number> {
    const existingAllergy = await tx.allergy.findFirst({
      where: { name: { equals: allergyName, mode: 'insensitive' } },
    });

    if (existingAllergy) {
      return existingAllergy.id;
    }

    const newAllergy = await tx.allergy.create({
      data: { name: allergyName },
    });

    return newAllergy.id;
  }

  private async findOneFormatted(tx: any, dependentId: string) {
    const dependent = await tx.dependent.findUnique({
      where: { id: dependentId },
      include: {
        caregivers: {
          include: {
            caregiver: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        familyMembers: {
          include: {
            family: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        conditions: { include: { condition: true } },
        allergies: { include: { allergy: true } },
        emergencyContacts: true,
        events: true,
        documents: true,
      },
    });

    if (!dependent) {
      return null;
    }

    return this.formatDependentResponse(dependent);
  }

  private formatDependentResponse(dependent: any) {
    return {
      id: dependent.id,
      name: dependent.name,
      age: dependent.age,
      susCode: dependent.susCode,
      createdAt: dependent.createdAt,
      updatedAt: dependent.updatedAt,

      conditions: dependent.conditions.map(
        (relation: any) => relation.condition.name,
      ),

      allergies: dependent.allergies.map(
        (relation: any) => relation.allergy.name,
      ),

      caregivers: dependent.caregivers.map((relation: any) => ({
        id: relation.caregiver.id,
        name: relation.caregiver.name,
        email: relation.caregiver.email,
        phone: relation.caregiver.phone,
      })),

      familyMembers: dependent.familyMembers.map((relation: any) => ({
        id: relation.family.id,
        name: relation.family.name,
        email: relation.family.email,
        phone: relation.family.phone,
      })),

      emergencyContacts: dependent.emergencyContacts.map((contact: any) => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        kinship: contact.kinship,
      })),

      events: dependent.events,
      documents: dependent.documents,
    };
  }
}
