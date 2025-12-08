import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const AddCaregiverSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
});

export class AddCaregiverDto extends createZodDto(AddCaregiverSchema) {}
