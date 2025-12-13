import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const DocumentTypeEnum = z.enum(['PRESCRIPTION', 'REPORT', 'EXAM', 'OTHER']);

const CreateDocumentSchema = z.object({
  dependentId: z.string().uuid('ID do dependente inválido'),
  title: z.string().min(1, 'Título é obrigatório'),
  type: DocumentTypeEnum,
  date: z.coerce.date({ message: 'Data é obrigatória' }),
  fileUrl: z.string().url('URL do arquivo inválida'),
  comments: z.string().optional(),
});

export class CreateDocumentDto extends createZodDto(CreateDocumentSchema) {}

