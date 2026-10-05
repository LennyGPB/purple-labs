import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Connexion directe (non poolée) : requise par `prisma migrate`.
    // Lecture tolérante pour que `prisma generate` fonctionne sans base configurée.
    url: process.env.DIRECT_URL ?? "",
  },
});
