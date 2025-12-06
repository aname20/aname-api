import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { MedicationLogStatus } from '@prisma/client';

export const CreateMedicationLogSchema = z.object({
  caregiverId: z.string().uuid(),
  takenAt: z.coerce.date(),
  status: z.nativeEnum(MedicationLogStatus),
  notes: z.string().optional(),
});

export class CreateMedicationLogDto extends createZodDto(
  CreateMedicationLogSchema,
) {}
