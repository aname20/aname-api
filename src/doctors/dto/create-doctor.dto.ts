import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateDoctorSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    specialty: z.string().min(1, 'Especialidade é obrigatória'),
});

export class CreateDoctorDto extends createZodDto(CreateDoctorSchema) {
    name: string;
    specialty: string;
}
