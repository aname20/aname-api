import {
  MedicationLogStatus,
  PrescriptionType,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function prescriptionSeed(prisma: PrismaClient) {
  // Limpa dados para facilitar reexecuções locais
  await prisma.$transaction([
    prisma.medicationLog.deleteMany(),
    prisma.prescriptionSchedule.deleteMany(),
    prisma.prescription.deleteMany(),
    prisma.dependentCaregiver.deleteMany(),
    prisma.dependentFamily.deleteMany(),
    prisma.user.deleteMany(),
    prisma.dependent.deleteMany(),
    prisma.medication.deleteMany(),
  ]);

  // Usuários
  const usersData = [
    {
      key: 'caregiver1',
      name: 'Alice Cuidadora',
      email: 'caregiver1@example.com',
      phone: '+55 11 99999-1111',
      password: 'Caregiver@123',
      role: UserRole.CAREGIVER,
    },
    {
      key: 'caregiver2',
      name: 'Carlos Cuidador',
      email: 'caregiver2@example.com',
      phone: '+55 11 99999-2222',
      password: 'Caregiver@123',
      role: UserRole.CAREGIVER,
    },
    {
      key: 'family1',
      name: 'Beatriz Familiar',
      email: 'family1@example.com',
      phone: '+55 11 99999-3333',
      password: 'Family@123',
      role: UserRole.FAMILY,
    },
    {
      key: 'family2',
      name: 'Bruno Familiar',
      email: 'family2@example.com',
      phone: '+55 11 99999-4444',
      password: 'Family@123',
      role: UserRole.FAMILY,
    },
  ];

  const users = await Promise.all(
    usersData.map(async (u) => {
      const { name, email, phone, password, role } = u;

      const hashed = await bcrypt.hash(password, 10);

      return prisma.user.create({
        data: { name, email, phone, role, password: hashed },
      });
    }),
  );
  const usersByKey = Object.fromEntries(
    users.map((u, i) => [usersData[i].key, u]),
  );

  // Dependentes
  const dependentsData = [
    { key: 'dep1', name: 'João Paciente', age: 72, susCode: '1234567890' },
    { key: 'dep2', name: 'Maria Paciente', age: 65, susCode: '9876543210' },
    { key: 'dep3', name: 'Pedro Paciente', age: 58, susCode: '4567891230' },
  ];
  const dependents = await Promise.all(
    dependentsData.map((d) =>
      prisma.dependent.create({
        data: { name: d.name, age: d.age, susCode: d.susCode },
      }),
    ),
  );
  const dependentsByKey = Object.fromEntries(
    dependents.map((d, i) => [dependentsData[i].key, d]),
  );

  // Vinculações cuidador/familiar
  await prisma.$transaction([
    prisma.dependentCaregiver.create({
      data: {
        caregiverId: usersByKey.caregiver1.id,
        dependentId: dependentsByKey['dep1'].id,
      },
    }),
    prisma.dependentCaregiver.create({
      data: {
        caregiverId: usersByKey.caregiver2.id,
        dependentId: dependentsByKey['dep2'].id,
      },
    }),
    prisma.dependentCaregiver.create({
      data: {
        caregiverId: usersByKey.caregiver1.id,
        dependentId: dependentsByKey['dep3'].id,
      },
    }),
    prisma.dependentFamily.create({
      data: {
        familyId: usersByKey.family1.id,
        dependentId: dependentsByKey['dep1'].id,
      },
    }),
    prisma.dependentFamily.create({
      data: {
        familyId: usersByKey.family2.id,
        dependentId: dependentsByKey['dep2'].id,
      },
    }),
  ]);

  // Medicamentos
  const medicationsData = [
    {
      key: 'atorvastatina',
      name: 'Atorvastatina',
      description: 'Hipocolesterolemiante',
    },
    { key: 'metformina', name: 'Metformina', description: 'Antidiabético' },
    { key: 'losartana', name: 'Losartana', description: 'Anti-hipertensivo' },
    { key: 'omeprazol', name: 'Omeprazol', description: 'IBP' },
  ];
  const medications = await Promise.all(
    medicationsData.map((m) =>
      prisma.medication.create({
        data: { name: m.name, description: m.description },
      }),
    ),
  );
  const medsByKey = Object.fromEntries(
    medications.map((m, i) => [medicationsData[i].key, m]),
  );

  // Prescrições com agendas
  const prescriptionsData = [
    {
      key: 'p1',
      dependentKey: 'dep1',
      medKey: 'atorvastatina',
      dosage: '10mg',
      doctorName: 'Dra. Maria Silva',
      doctorCrm: 'CRM-SP 123456',
      notes: 'Tomar após o jantar. Revisar em 30 dias.',
      startDate: '2025-12-01T00:00:00Z',
      endDate: '2026-01-15T00:00:00Z',
      type: PrescriptionType.CONTINUOUS,
      schedules: ['08:00', '20:00'],
    },
    {
      key: 'p2',
      dependentKey: 'dep1',
      medKey: 'metformina',
      dosage: '500mg',
      doctorName: 'Dr. Paulo Lima',
      doctorCrm: 'CRM-SP 222333',
      notes: 'Antes das refeições.',
      startDate: '2025-12-05T00:00:00Z',
      endDate: null,
      type: PrescriptionType.CONTINUOUS,
      schedules: ['07:30', '19:30'],
    },
    {
      key: 'p3',
      dependentKey: 'dep2',
      medKey: 'losartana',
      dosage: '50mg',
      doctorName: 'Dra. Clara Nunes',
      doctorCrm: 'CRM-SP 444555',
      notes: 'Monitorar PA semanal.',
      startDate: '2025-12-03T00:00:00Z',
      endDate: '2026-02-01T00:00:00Z',
      type: PrescriptionType.INTERMITTENT,
      schedules: ['09:00'],
    },
    {
      key: 'p4',
      dependentKey: 'dep2',
      medKey: 'omeprazol',
      dosage: '20mg',
      doctorName: 'Dr. Lucas Prado',
      doctorCrm: 'CRM-SP 777888',
      notes: 'Em jejum.',
      startDate: '2025-12-07T00:00:00Z',
      endDate: null,
      type: PrescriptionType.CONTINUOUS,
      schedules: ['06:30'],
    },
    {
      key: 'p5',
      dependentKey: 'dep3',
      medKey: 'atorvastatina',
      dosage: '20mg',
      doctorName: 'Dra. Ana Souza',
      doctorCrm: 'CRM-SP 999000',
      notes: 'Revisar enzimas hepáticas em 45 dias.',
      startDate: '2025-12-02T00:00:00Z',
      endDate: '2026-03-01T00:00:00Z',
      type: PrescriptionType.CONTINUOUS,
      schedules: ['21:00'],
    },
  ];

  const prescriptions = await Promise.all(
    prescriptionsData.map((p) =>
      prisma.prescription.create({
        data: {
          dependentId: dependentsByKey[p.dependentKey].id,
          medicationId: medsByKey[p.medKey].id,
          dosage: p.dosage,
          doctorName: p.doctorName,
          doctorCrm: p.doctorCrm,
          notes: p.notes,
          startDate: new Date(p.startDate),
          endDate: p.endDate ? new Date(p.endDate) : null,
          type: p.type,
          schedules: {
            create: p.schedules.map((time) => ({ time })),
          },
        },
        include: { schedules: true },
      }),
    ),
  );
  const prescriptionsByKey = Object.fromEntries(
    prescriptions.map((p, i) => [prescriptionsData[i].key, p]),
  );

  // Logs de medicação (>=10 registros)
  const logsData = [
    {
      prescriptionKey: 'p1',
      caregiverKey: 'caregiver1',
      takenAt: '2025-12-08T08:05:00Z',
      status: MedicationLogStatus.TAKEN,
      notes: 'Tomou normalmente.',
    },
    {
      prescriptionKey: 'p1',
      caregiverKey: 'caregiver1',
      takenAt: '2025-12-08T20:05:00Z',
      status: MedicationLogStatus.MISSED,
      notes: 'Paciente recusou, tentar novamente.',
    },
    {
      prescriptionKey: 'p1',
      caregiverKey: 'caregiver1',
      takenAt: '2025-12-09T08:03:00Z',
      status: MedicationLogStatus.TAKEN,
      notes: 'Ok.',
    },
    {
      prescriptionKey: 'p2',
      caregiverKey: 'caregiver1',
      takenAt: '2025-12-08T07:35:00Z',
      status: MedicationLogStatus.TAKEN,
      notes: '',
    },
    {
      prescriptionKey: 'p2',
      caregiverKey: 'caregiver1',
      takenAt: '2025-12-08T19:40:00Z',
      status: MedicationLogStatus.TAKEN,
      notes: '',
    },
    {
      prescriptionKey: 'p3',
      caregiverKey: 'caregiver2',
      takenAt: '2025-12-08T09:10:00Z',
      status: MedicationLogStatus.REFUSED,
      notes: 'Paciente não quis, monitorar pressão.',
    },
    {
      prescriptionKey: 'p3',
      caregiverKey: 'caregiver2',
      takenAt: '2025-12-09T09:05:00Z',
      status: MedicationLogStatus.TAKEN,
      notes: 'Tomou com água.',
    },
    {
      prescriptionKey: 'p4',
      caregiverKey: 'caregiver2',
      takenAt: '2025-12-08T06:40:00Z',
      status: MedicationLogStatus.TAKEN,
      notes: '',
    },
    {
      prescriptionKey: 'p4',
      caregiverKey: 'caregiver2',
      takenAt: '2025-12-09T06:32:00Z',
      status: MedicationLogStatus.TAKEN,
      notes: '',
    },
    {
      prescriptionKey: 'p5',
      caregiverKey: 'caregiver1',
      takenAt: '2025-12-08T21:10:00Z',
      status: MedicationLogStatus.TAKEN,
      notes: 'Sem efeitos adversos.',
    },
    {
      prescriptionKey: 'p5',
      caregiverKey: 'caregiver1',
      takenAt: '2025-12-09T21:02:00Z',
      status: MedicationLogStatus.TAKEN,
      notes: '',
    },
  ];

  await Promise.all(
    logsData.map((log) =>
      prisma.medicationLog.create({
        data: {
          prescriptionId: prescriptionsByKey[log.prescriptionKey].id,
          caregiverId: usersByKey[log.caregiverKey].id,
          takenAt: new Date(log.takenAt),
          status: log.status,
          notes: log.notes,
        },
      }),
    ),
  );
}
