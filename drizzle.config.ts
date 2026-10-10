import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

import { getDatabaseUrl } from "./src/db/database-url";

config({ quiet: true });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: getDatabaseUrl() },
});
