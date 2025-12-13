import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto, userId: string) {
    await this.validateDependentAccess(createDocumentDto.dependentId, userId);

    const document = await this.prisma.document.create({
      data: {
        dependentId: createDocumentDto.dependentId,
        title: createDocumentDto.title,
        type: createDocumentDto.type,
        date: createDocumentDto.date,
        fileUrl: createDocumentDto.fileUrl,
        comments: createDocumentDto.comments,
      },
      include: {
        dependent: {
          select: { id: true, name: true },
        },
      },
    });

    return this.formatDocumentResponse(document);
  }

  async findAll(userId: string, dependentId?: string) {
    const accessibleDependentIds = await this.getAccessibleDependentIds(userId);

    const whereCondition = {
      dependentId: dependentId
        ? { in: accessibleDependentIds.filter((id) => id === dependentId) }
        : { in: accessibleDependentIds },
    };

    const documents = await this.prisma.document.findMany({
      where: whereCondition,
      include: {
        dependent: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return documents.map((doc) => this.formatDocumentResponse(doc));
  }

  async findOne(id: number, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        dependent: {
          select: { id: true, name: true },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    await this.validateDependentAccess(document.dependentId, userId);

    return this.formatDocumentResponse(document);
  }

  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
    userId: string,
  ) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    await this.validateDependentAccess(document.dependentId, userId);

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: updateDocumentDto,
      include: {
        dependent: {
          select: { id: true, name: true },
        },
      },
    });

    return this.formatDocumentResponse(updatedDocument);
  }

  async remove(id: number, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    await this.validateDependentAccess(document.dependentId, userId);

    await this.prisma.document.delete({
      where: { id },
    });

    return { message: 'Documento removido com sucesso' };
  }

  private async validateDependentAccess(
    dependentId: string,
    userId: string,
  ): Promise<void> {
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
        'Acesso negado: Você não tem permissão para acessar este dependente.',
      );
    }
  }

  private async getAccessibleDependentIds(userId: string): Promise<string[]> {
    const dependents = await this.prisma.dependent.findMany({
      where: {
        OR: [
          { familyMembers: { some: { familyId: userId } } },
          { caregivers: { some: { caregiverId: userId } } },
        ],
      },
      select: { id: true },
    });

    return dependents.map((d) => d.id);
  }

  private formatDocumentResponse(document: any) {
    return {
      id: document.id,
      title: document.title,
      type: document.type,
      date: document.date,
      fileUrl: document.fileUrl,
      comments: document.comments,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      dependent: document.dependent,
    };
  }
}
