import { EventStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
  status: z.nativeEnum(EventStatus).optional(),
  location: z.string().optional(),
  dependentId: z.string().uuid().optional(),
  doctorName: z.string().optional(),
  doctorCrm: z.string().optional(),
});

export class UpdateEventDto extends createZodDto(UpdateEventSchema) {
  title?: string;
  description?: string;
  date?: Date;
  status?: EventStatus;
  location?: string;
  dependentId?: string;
  doctorName?: string;
  doctorCrm?: string;
}
