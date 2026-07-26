import { PrismaClient } from "@prisma/client";
import { hashIp } from "../src/lib/privacy";

const prisma = new PrismaClient();

async function main() {
  console.log("[Migration] Starting IP anonymization and hashing for existing database records...");

  const stats = await prisma.dailyStat.findMany({
    where: {
      ipAddress: {
        not: null,
      },
    },
  });

  console.log(`[Migration] Found ${stats.length} total DailyStat records.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const stat of stats) {
    if (!stat.ipAddress || stat.ipAddress.startsWith("anon_")) {
      skippedCount++;
      continue;
    }

    const hashed = hashIp(stat.ipAddress);

    await prisma.dailyStat.update({
      where: { id: stat.id },
      data: { ipAddress: hashed },
    });

    updatedCount++;
  }

  console.log(
    `[Migration] Completed IP anonymization: ${updatedCount} records updated, ${skippedCount} records already anonymized/skipped.`
  );
}

main()
  .catch((e) => {
    console.error("[Migration] Error during IP anonymization:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
