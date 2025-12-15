import { EventStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateEventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  date: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => new Date(val)),
  status: z.nativeEnum(EventStatus).optional().default(EventStatus.SCHEDULED),
  location: z.string().optional(),
  dependentId: z.string().uuid('ID do dependente inválido'),
  doctorName: z.string().optional(),
  doctorCrm: z.string().optional(),
});

export class CreateEventDto extends createZodDto(CreateEventSchema) {
  title: string;
  description?: string;
  date: Date;
  status: EventStatus;
  location?: string;
  dependentId: string;
  doctorName?: string;
  doctorCrm?: string;
}
