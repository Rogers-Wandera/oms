import "dotenv/config";
import { db } from "../lib/db";
import { departments, users } from "../lib/db/schema";
import bcrypt from "bcryptjs";
import readline from "readline";
import fs from "fs";
import path from "path";
import { count, eq } from "drizzle-orm";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("🚀 Starting secure database seeding...");

  // 1. Handle System Password
  let systemPassword = process.env.SYSTEM_PASSWORD;

  if (!systemPassword) {
    console.log("\n⚠️  SYSTEM_PASSWORD not found in .env");
    systemPassword = await question(
      "Please enter a new System Password to secure the system: ",
    );

    if (!systemPassword) {
      console.error("❌ System Password is required. Seeding aborted.");
      process.exit(1);
    }

    // Update .env file
    const envPath = path.resolve(process.cwd(), ".env");
    let envContent = fs.readFileSync(envPath, "utf-8");

    if (envContent.includes("SYSTEM_PASSWORD=")) {
      envContent = envContent.replace(
        /SYSTEM_PASSWORD=.*/,
        `SYSTEM_PASSWORD=${systemPassword}`,
      );
    } else {
      envContent += `\nSYSTEM_PASSWORD=${systemPassword}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("✅ SYSTEM_PASSWORD saved to .env");
  } else {
    const inputPassword = await question(
      "Enter System Password to proceed with seeding: ",
    );
    if (inputPassword !== systemPassword) {
      console.error("❌ Incorrect System Password. Seeding aborted.");
      process.exit(1);
    }
  }

  try {
    // 2. Check if data already exists
    const userCount = await db.select({ value: count() }).from(users);
    if (userCount[0].value > 0) {
      console.log(
        "⚠️  Data already exists in the database. Skipping seeding to prevent overwrites.",
      );
      process.exit(0);
    }

    // 3. Run seeding in a transaction
    await db.transaction(async (tx) => {
      console.log("📦 Seeding departments...");
      const [itDept] = await tx
        .insert(departments)
        .values([
          { name: "Information Technology" },
          { name: "Human Resources" },
          { name: "Operations" },
        ])
        .returning();

      console.log("👤 Seeding initial admin user...");
      const adminPassword = process.env.ADMIN_PASSWORD || "password123";
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

      await tx.insert(users).values({
        firstName: "Wandera",
        lastName: "Rogers",
        email: "rogerrisha@gmail.com",
        password: hashedAdminPassword,
        role: "ADMIN",
        departmentId: itDept.id,
        isVerified: true,
      });

      console.log("✅ Seeding completed successfully!");
    });
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();
