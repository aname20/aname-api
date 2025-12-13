import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const DocumentTypeEnum = z.enum(['PRESCRIPTION', 'REPORT', 'EXAM', 'OTHER']);

const UpdateDocumentSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  type: DocumentTypeEnum.optional(),
  date: z.coerce.date().optional(),
  fileUrl: z.string().url('URL do arquivo inválida').optional(),
  comments: z.string().optional(),
});

export class UpdateDocumentDto extends createZodDto(UpdateDocumentSchema) {}

