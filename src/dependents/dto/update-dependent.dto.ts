import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const EmergencyContactUpdateSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Nome do contato é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  kinship: z.string().optional(),
});

const UpdateDependentSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.number().int().min(0).optional(),
  susCode: z.string().optional(),
  avatar: z.string().url('URL do avatar inválida').optional(),
  conditions: z.array(z.string().min(1)).optional(),
  allergies: z.array(z.string().min(1)).optional(),
  caregiverIds: z.array(z.string().uuid()).optional(),
  emergencyContacts: z.array(EmergencyContactUpdateSchema).optional(),
});

export class UpdateDependentDto extends createZodDto(UpdateDependentSchema) {}
