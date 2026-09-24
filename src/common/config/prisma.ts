import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { env } from "./env.js";
import { TransactionClient } from "../../../generated/prisma/internal/prismaNamespace.js";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export async function testDbConnection() {
  try {
    await prisma.$connect();

    await prisma.$queryRaw`SELECT 1`;

    console.log("Database connected.");
  } catch (error) {
    console.error(`Database connection failed:`, error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

export type DbClient = TransactionClient | PrismaClient;
