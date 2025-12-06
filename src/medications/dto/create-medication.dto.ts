import { IsString, IsOptional } from 'class-validator';

export class CreateMedicationDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
