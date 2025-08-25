// Prisma types augmentation for better IDE support
import { PrismaClient } from '@prisma/client';

declare global {
  namespace PrismaNamespace {
    type Client = PrismaClient;
  }
}

export {};
