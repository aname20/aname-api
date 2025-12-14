import { EventStatus, PrismaClient } from '@prisma/client';

export async function eventSeed(prisma: PrismaClient) {
  // Limpa dados para facilitar reexecuções locais
  await prisma.$transaction([
    prisma.event.deleteMany(),
    prisma.doctor.deleteMany(),
  ]);

  const dependentId = '25521ad6-e3e2-4621-aea6-44da1002260a';

  // Verifica se o dependente existe
  const dependent = await prisma.dependent.findUnique({
    where: { id: dependentId },
  });

  if (!dependent) {
    throw new Error(
      `Dependent with ID ${dependentId} not found. Please ensure the dependent exists before running this seed.`,
    );
  }

  console.log(`Creating events for dependent: ${dependent.name}`);

  // Cria médicos
  const doctorsData = [
    { key: 'cardio', name: 'Dr. Carlos Mendes', specialty: 'Cardiologia' },
    { key: 'neuro', name: 'Dra. Ana Paula', specialty: 'Neurologia' },
    { key: 'geriatra', name: 'Dr. Roberto Silva', specialty: 'Geriatria' },
    { key: 'ortopedista', name: 'Dra. Juliana Costa', specialty: 'Ortopedia' },
  ];

  const doctors = await Promise.all(
    doctorsData.map((d) =>
      prisma.doctor.create({
        data: { name: d.name, specialty: d.specialty },
      }),
    ),
  );

  const doctorsByKey = Object.fromEntries(
    doctors.map((d, i) => [doctorsData[i].key, d]),
  );

  // Cria eventos
  const eventsData = [
    {
      title: 'Consulta Cardiológica',
      description: 'Consulta de rotina para avaliação cardiovascular',
      date: '2025-12-20T10:00:00Z',
      status: EventStatus.SCHEDULED,
      location: 'Hospital São Lucas - Sala 302',
      doctorKey: 'cardio',
    },
    {
      title: 'Exame de Ecocardiograma',
      description: 'Ecocardiograma com doppler colorido',
      date: '2025-12-22T14:30:00Z',
      status: EventStatus.SCHEDULED,
      location: 'Clínica Diagnóstica - 2º Andar',
      doctorKey: 'cardio',
    },
    {
      title: 'Consulta Neurológica',
      description: 'Avaliação neurológica e ajuste de medicação',
      date: '2025-12-18T09:00:00Z',
      status: EventStatus.SCHEDULED,
      location: 'Centro Médico Recife - Consultório 15',
      doctorKey: 'neuro',
    },
    {
      title: 'Consulta Geriátrica',
      description: 'Avaliação geriátrica ampla',
      date: '2025-12-15T11:00:00Z',
      status: EventStatus.SCHEDULED,
      location: 'Clínica da Terceira Idade',
      doctorKey: 'geriatra',
    },
    {
      title: 'Fisioterapia',
      description: 'Sessão de fisioterapia para mobilidade',
      date: '2025-12-16T15:00:00Z',
      status: EventStatus.SCHEDULED,
      location: 'Centro de Reabilitação - Sala 5',
      doctorKey: null,
    },
    {
      title: 'Consulta Ortopédica',
      description: 'Avaliação de dor no joelho direito',
      date: '2025-12-28T16:00:00Z',
      status: EventStatus.SCHEDULED,
      location: 'Hospital Esperança - Ortopedia',
      doctorKey: 'ortopedista',
    },
    {
      title: 'Exames de Sangue',
      description: 'Coleta de sangue para hemograma completo e glicemia',
      date: '2025-12-14T07:30:00Z',
      status: EventStatus.DONE,
      location: 'Laboratório Central',
      doctorKey: null,
    },
    {
      title: 'Consulta Cardiológica - Retorno',
      description: 'Retorno para avaliação de resultados de exames',
      date: '2025-12-10T10:00:00Z',
      status: EventStatus.DONE,
      location: 'Hospital São Lucas - Sala 302',
      doctorKey: 'cardio',
    },
    {
      title: 'Vacinação Gripe',
      description: 'Vacina anual contra influenza',
      date: '2025-12-05T14:00:00Z',
      status: EventStatus.DONE,
      location: 'Posto de Saúde Central',
      doctorKey: null,
    },
    {
      title: 'Consulta Oftalmológica',
      description: 'Consulta cancelada - reagendar',
      date: '2025-12-12T13:00:00Z',
      status: EventStatus.CANCELED,
      location: 'Clínica de Olhos',
      doctorKey: null,
    },
  ];

  const events = await Promise.all(
    eventsData.map((e) =>
      prisma.event.create({
        data: {
          title: e.title,
          description: e.description,
          date: new Date(e.date),
          status: e.status,
          location: e.location,
          dependentId: dependentId,
          doctorId: e.doctorKey ? doctorsByKey[e.doctorKey].id : null,
        },
      }),
    ),
  );

  console.log(`✅ Created ${doctors.length} doctors`);
  console.log(`✅ Created ${events.length} events for dependent ${dependent.name}`);
  console.log('\nEvents summary:');
  console.log(`  - SCHEDULED: ${events.filter((e) => e.status === EventStatus.SCHEDULED).length}`);
  console.log(`  - DONE: ${events.filter((e) => e.status === EventStatus.DONE).length}`);
  console.log(`  - CANCELED: ${events.filter((e) => e.status === EventStatus.CANCELED).length}`);
}
