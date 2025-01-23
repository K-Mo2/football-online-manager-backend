import { createTeamsWithPlayers } from "./../src/services/playersService";
import { prisma } from "../src/lib/prisma";

// Main seeding function
async function seed() {
  try {
    console.log("Starting seeding...");

    // Clear existing data
    await prisma.player.deleteMany();
    await prisma.team.deleteMany();
    await createTeamsWithPlayers(3, 25);
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Execute the seeder
seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
