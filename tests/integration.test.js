const assert = require("assert");

// Pure JS equivalent of src/lib/geo.ts calculateScore formula for lightweight runtime validation
function calculateScore(distanceInMeters) {
  if (distanceInMeters <= 15) {
    return 5000;
  }

  const k = 450;
  const score = Math.round(5000 * Math.exp(-(distanceInMeters - 15) / k));
  return Math.max(0, Math.min(5000, score));
}

console.log("-----------------------------------------");
console.log("     RUNNING UFGuesser SYSTEM TESTS      ");
console.log("-----------------------------------------");

// Test 1: Scoring System assertions
try {
  console.log("Running Test 1: Scoring Proximity...");
  
  // Exact or close match (<= 15 meters) must yield a perfect 5000 points
  assert.strictEqual(calculateScore(0), 5000, "0 meters must be 5k points");
  assert.strictEqual(calculateScore(10), 5000, "10 meters must be 5k points");
  assert.strictEqual(calculateScore(15), 5000, "15 meters must be 5k points");
  
  // Decays should scale down continuously beyond 15 meters
  const scoreAt16 = calculateScore(16);
  assert.ok(scoreAt16 < 5000, "16 meters must be less than 5k points");
  assert.ok(scoreAt16 > 4900, "16 meters must be highly accurate, close to 5k points");
  
  const scoreAt465 = calculateScore(465); // 450 meters from boundary
  assert.ok(scoreAt465 > 1800 && scoreAt465 < 1900, "465 meters should decay smoothly with standard k=450 decay");

  console.log("✔ Test 1 passed: Scoring is correct!");
} catch (error) {
  console.error("❌ Test 1 failed:", error.message);
  process.exit(1);
}

// Test 2: Asset and Image Removal Verifications
try {
  console.log("Running Test 2: Local SVG Asset Checking...");
  const fs = require("fs");
  const path = require("path");

  const uploadsDir = path.join(__dirname, "..", "uploads");
  assert.ok(fs.existsSync(uploadsDir), "uploads/ directory must exist in workspace root");

  // Verify default landmark graphics were generated correctly
  const standardSVGs = [
    "century_tower.svg",
    "swamp.svg",
    "reitz_union.svg",
    "marston.svg"
  ];

  for (const filename of standardSVGs) {
    const filePath = path.join(uploadsDir, filename);
    assert.ok(fs.existsSync(filePath), `Generated landmark asset ${filename} must exist on disk`);
  }

  console.log("✔ Test 2 passed: All offline local SVG assets generated cleanly!");
} catch (error) {
  console.error("❌ Test 2 failed:", error.message);
  process.exit(1);
}

// Test 3: Sandbox/Prisma schema fields validation
async function runDatabaseTests() {
  try {
    console.log("Running Test 3: Database Schema & Pending Upload Validation...");
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    // Query active locations
    const approvedLocations = await prisma.location.findMany({
      where: { approved: true }
    });
    
    // Ensure all seed defaults are marked as approved: true
    assert.ok(approvedLocations.length > 0, "Approved locations must exist");
    
    // Ensure none of them contain a Wikimedia/Wikipedia URL
    for (const loc of approvedLocations) {
      assert.ok(!loc.imageUrl.includes("wikimedia.org"), `Location ${loc.name} must not use Wikimedia url`);
      assert.ok(!loc.imageUrl.includes("wikipedia.org"), `Location ${loc.name} must not use Wikipedia url`);
    }

    console.log("✔ Test 3 passed: Database constraints and offline image migration validated!");
    await prisma.$disconnect();
    
    console.log("\n-----------------------------------------");
    console.log("   ALL UFGuesser SYSTEM TESTS PASSED!   ");
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("❌ Test 3 failed:", error.message);
    process.exit(1);
  }
}

runDatabaseTests();
