import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateDoctorSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').optional(),
    specialty: z.string().min(1, 'Especialidade é obrigatória').optional(),
});

export class UpdateDoctorDto extends createZodDto(UpdateDoctorSchema) {
    name?: string;
    specialty?: string;
}
