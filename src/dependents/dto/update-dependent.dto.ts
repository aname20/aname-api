import { createZodDto } from 'nestjs-zod';
import { CreateDependentDto } from './create-dependent.dto';

// O partial() torna todos os campos opcionais automaticamente
const UpdateDependentSchema = CreateDependentDto.schema.partial();

export class UpdateDependentDto extends createZodDto(UpdateDependentSchema) {}
