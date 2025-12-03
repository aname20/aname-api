import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PrescriptionType } from '@prisma/client';

const ScheduleSchema = z.object({
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:mm'),
});

export const CreatePrescriptionSchema = z.object({
  dependentId: z.string().uuid(),
  medicationId: z.number().int().positive(),
  dosage: z.string().optional(),
  doctorName: z.string().optional(),
  doctorCrm: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  type: z.nativeEnum(PrescriptionType),
  schedules: z
    .array(ScheduleSchema)
    .min(1, 'At least one schedule is required'),
});

export class CreatePrescriptionDto extends createZodDto(
  CreatePrescriptionSchema,
) {}
