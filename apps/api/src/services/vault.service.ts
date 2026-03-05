import { prisma } from "@repo/db";

export async function createVault(userId: string, name: string) {
  return prisma.vault.create({
    data: {
      name,
      userId,
    },
  });
}

export async function getVaults(userId: string) {
  return prisma.vault.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteVault(userId: string, vaultId: string) {
  return prisma.vault.delete({
    where: {
      id: vaultId,
      userId,
    },
  });
}
