import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// La connexion n'est ouverte qu'à la première requête : l'import reste sûr au build.
function createPrismaClient() {
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });
}

// Singleton conservé entre les rechargements à chaud en dev.
// On mémorise aussi la classe : après un `prisma generate` (nouveau modèle), le client généré
// est rechargé avec une nouvelle classe, et l'ancienne instance est alors remplacée.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaClass?: typeof PrismaClient;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma && globalForPrisma.prismaClass === PrismaClient) return globalForPrisma.prisma;
  void globalForPrisma.prisma?.$disconnect();
  return createPrismaClient();
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaClass = PrismaClient;
}
