import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const EmergencyContactSchema = z.object({
  name: z.string().min(1, 'Nome do contato é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  kinship: z.string().optional(),
});

const CreateDependentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  age: z.number({ message: 'Idade é obrigatória' }).int().min(0),
  susCode: z.string().optional(),
  avatar: z.string().url('URL do avatar inválida').optional(),
  conditions: z.array(z.string().min(1)).optional().default([]),
  allergies: z.array(z.string().min(1)).optional().default([]),
  caregiverIds: z.array(z.string().uuid()).optional().default([]),
  emergencyContacts: z.array(EmergencyContactSchema).optional().default([]),
});

export class CreateDependentDto extends createZodDto(CreateDependentSchema) {}

export type EmergencyContactInput = z.infer<typeof EmergencyContactSchema>;
