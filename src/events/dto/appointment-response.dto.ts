export class AppointmentDto {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

export class AppointmentGroupDto {
  date: string;
  dayOfWeek: string;
  appointments: AppointmentDto[];
}

