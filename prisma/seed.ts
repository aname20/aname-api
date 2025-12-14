import { PrismaClient } from '@prisma/client';
import { prescriptionSeed } from './seeds/prescription.seed';
import { medicationSeed } from './seeds/medication.seed';
import { eventSeed } from './seeds/event.seed';

type SeedName = 'prescription' | 'medication' | 'event';

const seedMap: Record<SeedName, (prisma: PrismaClient) => Promise<void>> = {
  prescription: prescriptionSeed,
  medication: medicationSeed,
  event: eventSeed,
};

async function main() {
  const seedName = (process.env.SEED as SeedName | undefined) ?? 'unknown';
  const seedFn = seedMap[seedName];

  if (!seedFn) {
    const available = Object.keys(seedMap).join(', ');
    throw new Error(
      `Seed "${seedName}" não existe. Seeds disponíveis: ${available}`,
    );
  }

  const prisma = new PrismaClient();

  await seedFn(prisma);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
