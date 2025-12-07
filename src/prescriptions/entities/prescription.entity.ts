import { PrescriptionType } from '@prisma/client';

export class PrescriptionEntity {
  id: number;
  dependentId: string;
  medicationId: number;
  dosage: string | null;
  doctorName: string | null;
  doctorCrm: string | null;
  notes: string | null;
  startDate: Date;
  endDate: Date | null;
  type: PrescriptionType;
  createdAt: Date;
  updatedAt: Date;

  schedules?: { id: number; time: string }[];
  medication?: { id: number; name: string };
  dependent?: { id: string; name: string };

  constructor(partial: Partial<PrescriptionEntity>) {
    Object.assign(this, partial);
  }
}
