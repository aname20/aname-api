export class MedicationByCaregiverResponseDto {
  id: number;
  name: string;
  dependentId: string;
  dependentName: string;
  doctorName: string | null;
  dosage: string | null;

  constructor(medication: any, prescription: any) {
    this.id = medication.id;
    this.name = medication.name;
    this.dependentId = prescription.dependent.id;
    this.dependentName = prescription.dependent.name;
    this.doctorName = prescription.doctorName;
    this.dosage = prescription.dosage;
  }
}
