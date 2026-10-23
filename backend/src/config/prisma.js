import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

const prismaGlobal = globalThis;

export const prisma =
  prismaGlobal.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (env.NODE_ENV !== "production") {
  prismaGlobal.prisma = prisma;
}

export default prisma;
