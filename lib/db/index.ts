import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import fs from "fs";
import path from "path";

// 1. Manually load .env at the very beginning (crucial for schema.ts evaluation)
if (!process.env.DATABASE_URL || !process.env.DB_SCHEMA) {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const parts = line.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim();
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

// 2. Set defaults if still missing to avoid Drizzle 'public' error in schema.ts
process.env.DB_SCHEMA = process.env.DB_SCHEMA || "oms";

import * as schema from "./schema";

const rawConnectionString = process.env.DATABASE_URL;

// 3. Append search_path to connection string if not present
let connectionString = rawConnectionString;
if (connectionString && !connectionString.includes("search_path")) {
  const schema = process.env.DB_SCHEMA || "oms";
  const separator = connectionString.includes("?") ? "&" : "?";
  connectionString = `${connectionString}${separator}options=-c%20search_path%3D${schema}`;
}

if (!connectionString) {
  console.error(
    "❌ DATABASE_URL is not defined in the environment or .env file.",
  );
}

// Global singleton pattern to prevent connection exhaustion in dev mode
const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

// For raw queries
export const sql = globalForDb.conn ?? postgres(connectionString || "");

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = sql;
}

// For Drizzle
export const db = drizzle(sql, { schema });
