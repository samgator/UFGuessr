const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database and generating local offline-ready SVG landmarks...");

  // Ensure root-level uploads folder exists
  const uploadsDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Helper to generate a gorgeous SVG landmark on disk if it doesn't exist
  function generateLandmarkSVG(filename, name, subtitle, color) {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) return;

    const svgContent = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0f172a"/>
  <!-- Decorative Grid -->
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <circle cx="400" cy="220" r="120" fill="${color}" opacity="0.15" filter="blur(40px)"/>
  
  <text x="50%" y="150" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#f8fafc" text-anchor="middle" letter-spacing="2">${name.toUpperCase()}</text>
  <text x="50%" y="190" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="${color}" text-anchor="middle" letter-spacing="4">${subtitle.toUpperCase()}</text>
  
  <!-- Map Pin Graphic -->
  <g transform="translate(400, 320) scale(1.5)">
    <path d="M0 -30 C-15 -30 -25 -15 -25 0 C-25 15 -10 30 0 45 C10 30 25 15 25 0 C25 -15 15 -30 0 -30 Z" fill="${color}"/>
    <circle cx="0" cy="-5" r="10" fill="#0f172a"/>
  </g>
  
  <!-- Orange/Blue UF Accent Bar -->
  <rect x="350" y="440" width="100" height="4" fill="#f97316" rx="2" />
  <rect x="375" y="450" width="50" height="4" fill="#3b82f6" rx="2" />
</svg>
`;
    fs.writeFileSync(filePath, svgContent.trim());
    console.log(`Generated SVG: ${filename}`);
  }

  // Generate local assets
  generateLandmarkSVG("century_tower.svg", "Century Tower", "Iconic Landmark Clocktower", "#f97316");
  generateLandmarkSVG("swamp.svg", "The Swamp", "Ben Hill Griffin Stadium", "#3b82f6");
  generateLandmarkSVG("reitz_union.svg", "Reitz Union", "Student Hub and Plaza", "#10b981");
  generateLandmarkSVG("marston.svg", "Marston Library", "Science & Engineering Library", "#06b6d4");
  generateLandmarkSVG("plaza.svg", "Plaza of the Americas", "Central Student Gathering Park", "#84cc16");
  generateLandmarkSVG("smathers.svg", "Smathers Library", "Special Collections & Archives", "#ec4899");
  generateLandmarkSVG("baughman.svg", "Baughman Center", "Lakeside Chapel", "#a855f7");
  generateLandmarkSVG("oconnell.svg", "O'Connell Center", "UF Basketball and Concert Dome", "#f43f5e");
  generateLandmarkSVG("auditorium.svg", "University Auditorium", "Historic Concert Hall", "#eab308");
  generateLandmarkSVG("museum.svg", "Natural History Museum", "Butterflies & Fossils Exhibit", "#14b8a6");

  // 1. Create default admin user if not exists
  const adminUsername = "admin";
  const adminPassword = "password123";
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
    console.log(`Created admin user: username='${adminUsername}', password='${adminPassword}'`);
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

  // 3. Populate default UF locations with local SVG urls
  const locations = [
    {
      name: "Century Tower",
      latitude: 29.6488,
      longitude: -82.3433,
      imageUrl: "/api/uploads/century_tower.svg",
      difficulty: "easy",
    },
    {
      name: "Ben Hill Griffin Stadium (The Swamp)",
      latitude: 29.6499,
      longitude: -82.3487,
      imageUrl: "/api/uploads/swamp.svg",
      difficulty: "easy",
    },
    {
      name: "J. Wayne Reitz Union",
      latitude: 29.6463,
      longitude: -82.3478,
      imageUrl: "/api/uploads/reitz_union.svg",
      difficulty: "easy",
    },
    {
      name: "Marston Science Library",
      latitude: 29.6480,
      longitude: -82.3438,
      imageUrl: "/api/uploads/marston.svg",
      difficulty: "medium",
    },
    {
      name: "Plaza of the Americas",
      latitude: 29.6483,
      longitude: -82.3440,
      imageUrl: "/api/uploads/plaza.svg",
      difficulty: "medium",
    },
    {
      name: "Smathers Library",
      latitude: 29.6512,
      longitude: -82.3429,
      imageUrl: "/api/uploads/smathers.svg",
      difficulty: "medium",
    },
    {
      name: "Baughman Center (Lake Alice)",
      latitude: 29.6433,
      longitude: -82.3615,
      imageUrl: "/api/uploads/baughman.svg",
      difficulty: "easy",
    },
    {
      name: "Stephen C. O'Connell Center",
      latitude: 29.6494,
      longitude: -82.3512,
      imageUrl: "/api/uploads/oconnell.svg",
      difficulty: "medium",
    },
    {
      name: "University Auditorium",
      latitude: 29.6490,
      longitude: -82.3429,
      imageUrl: "/api/uploads/auditorium.svg",
      difficulty: "easy",
    },
    {
      name: "Florida Museum of Natural History",
      latitude: 29.6366,
      longitude: -82.3701,
      imageUrl: "/api/uploads/museum.svg",
      difficulty: "hard",
    },
  ];

  for (const loc of locations) {
    const existing = await prisma.location.findFirst({
      where: { name: loc.name },
    });

    if (!existing) {
      await prisma.location.create({ data: loc });
      console.log(`Added location: ${loc.name}`);
    } else {
      // Always update the image to the local offline path if it was using a Wikimedia URL
      if (existing.imageUrl.includes("wikimedia") || existing.imageUrl.includes("wikipedia")) {
        await prisma.location.update({
          where: { id: existing.id },
          data: { imageUrl: loc.imageUrl },
        });
        console.log(`Migrated location image path to local offline SVG: ${loc.name}`);
      }
    }
  }

  // 4. Populate some Daily Queue items for next few days to allow gameplay if active
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dbLocations = await prisma.location.findMany();
  if (dbLocations.length > 0) {
    for (let i = 0; i < 5; i++) {
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + i);

      const existingQueue = await prisma.dailyQueue.findUnique({
        where: { scheduledDate },
      });

      if (!existingQueue) {
        const locationToSchedule = dbLocations[i % dbLocations.length];
        await prisma.dailyQueue.create({
          data: {
            locationId: locationToSchedule.id,
            scheduledDate,
          },
        });
        console.log(`Scheduled location '${locationToSchedule.name}' for ${scheduledDate.toDateString()}`);
      }
    }
  }

  console.log("Seeding and asset generation completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
