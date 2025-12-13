import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateDependentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  age: z.number({ message: 'Idade é obrigatória' }).int().min(0),
  susCode: z.string().optional(),
});
export class CreateDependentDto extends createZodDto(CreateDependentSchema) {}
