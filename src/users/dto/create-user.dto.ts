import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { UserRole } from '@prisma/client';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
