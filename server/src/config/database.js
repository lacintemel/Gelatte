import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Graceful shutdown — disconnect Prisma when the process exits
const shutdown = async () => {
  await prisma.$disconnect();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { prisma };
