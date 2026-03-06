import { prisma } from "@repo/db";
import { ApiError } from "../utils/apiError.js";

/**
 * Create document metadata in the database.
 */
export async function createDocumentMetadata(data: {
  title: string;
  mimeType: string;
  size: number;
  folderId: string;
  fileKey: string;
  encrypted: boolean;
  encryptionIv?: string;
  encryptionAlgo?: string;
  encryptionTag?: string;
}) {
  return prisma.document.create({ data });
}

/**
 * Get all documents in a folder (with vault ownership check).
 */
export async function getDocumentsByFolder(folderId: string, userId: string) {
  // Verify user owns the folder's vault
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      vault: { userId },
    },
  });

  if (!folder) {
    throw new ApiError(404, "Folder not found");
  }

  return prisma.document.findMany({
    where: { folderId },
    include: {
      tags: {
        include: { tag: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single document by ID (with ownership check).
 */
export async function getDocumentById(documentId: string, userId: string) {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      folder: {
        vault: { userId },
      },
    },
    include: {
      tags: {
        include: { tag: true },
      },
      shareLinks: {
        where: { revokedAt: null },
        select: { id: true, token: true, permission: true, expiresAt: true },
      },
    },
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  return document;
}

/**
 * Delete a document (with ownership check). Returns the deleted document for cleanup.
 */
export async function deleteDocument(documentId: string, userId: string) {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      folder: {
        vault: { userId },
      },
    },
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  await prisma.document.delete({ where: { id: documentId } });

  return document;
}

/**
 * Search documents by keyword across title and mimeType (with ownership).
 */
export async function searchDocuments(userId: string, query: string) {
  return prisma.document.findMany({
    where: {
      folder: {
        vault: { userId },
      },
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { mimeType: { contains: query, mode: "insensitive" } },
        {
          tags: {
            some: {
              tag: { name: { contains: query, mode: "insensitive" } },
            },
          },
        },
      ],
    },
    include: {
      tags: { include: { tag: true } },
      folder: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
