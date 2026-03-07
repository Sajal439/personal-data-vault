import { prisma } from "@repo/db";
import { ApiError } from "../utils/apiError.js";

export async function createFolder(
  userId: string,
  vaultId: string,
  name: string,
  parentId?: string,
) {
  const vault = await prisma.vault.findFirst({
    where: {
      id: vaultId,
      userId,
    },
  });

  if (!vault) {
    throw new ApiError(404, "Vault not found");
  }

  if (parentId) {
    const parentFolder = await prisma.folder.findFirst({
      where: {
        id: parentId,
        vaultId,
      },
      select: { id: true },
    });

    if (!parentFolder) {
      throw new ApiError(
        400,
        "Invalid parentId: parent folder must belong to the same vault",
      );
    }
  }

  return prisma.folder.create({
    data: {
      name,
      vaultId,
      parentId,
    },
  });
}

export async function getVaultFolders(vaultId: string, userId: string) {
  const vault = await prisma.vault.findFirst({
    where: {
      id: vaultId,
      userId,
    },
  });

  if (!vault) {
    throw new ApiError(404, "Vault not found");
  }

  return prisma.folder.findMany({
    where: {
      vaultId,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function deleteFolder(folderId: string, userId: string) {
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      vault: {
        userId,
      },
    },
  });

  if (!folder) {
    throw new ApiError(404, "Folder not found");
  }

  return prisma.folder.delete({
    where: { id: folderId },
  });
}
