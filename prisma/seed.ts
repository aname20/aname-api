import { PrismaClient } from '@prisma/client';
import { prescriptionSeed } from './seeds/prescription.seed';
import { medicationSeed } from './seeds/medication.seed';

type SeedName = 'prescription' | 'medication';

const seedMap: Record<SeedName, (prisma: PrismaClient) => Promise<void>> = {
  prescription: prescriptionSeed,
  medication: medicationSeed,
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
