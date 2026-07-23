const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with admin user and default settings...");

  // 1. Create admin user from environment variables
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error("Seeding failed: ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be defined.");
    process.exit(1);
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    await prisma.admin.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
      },
    });
    console.log(`Created admin user: username='${adminUsername}' (password hidden in logs)`);
  } else {
    console.log("Admin user already exists.");
  }

  // 2. Set default setting: daily_under_construction (feature flag)
  const existingFlag = await prisma.settings.findUnique({
    where: { key: "daily_under_construction" },
  });

  if (!existingFlag) {
    await prisma.settings.create({
      data: {
        key: "daily_under_construction",
        value: "true",
      },
    });
    console.log("Created 'daily_under_construction' setting with default value 'true'.");
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
