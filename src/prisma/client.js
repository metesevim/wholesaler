import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;

//import prisma = require("../prisma/client"); ile DB'ye erişmeyi sağlıyor.