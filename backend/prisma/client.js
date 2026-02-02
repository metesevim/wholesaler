import { PrismaClient } from "@prisma/client";

console.log("Initializing Prisma Client...");
const prisma = new PrismaClient();
console.log("Prisma Client initialized");

export default prisma;