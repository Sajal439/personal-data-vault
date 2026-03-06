import { prisma } from "@repo/db";
import { ApiError } from "../utils/apiError.js";

export async function createTag(userId: string, name: string) {
  const existing = await prisma.tag.findUnique({
    where: { name_userId: { name, userId } },
  });

  if (existing) {
    throw new ApiError(409, "Tag already exists");
  }

  return prisma.tag.create({
    data: { name, userId },
  });
}

export async function getUserTags(userId: string) {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function deleteTag(tagId: string, userId: string) {
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, userId },
  });

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  return prisma.tag.delete({ where: { id: tagId } });
}

export async function addTagToDocument(
  documentId: string,
  tagId: string,
  userId: string,
) {
  // Verify user owns the document
  const document = await prisma.document.findFirst({
    where: { id: documentId, folder: { vault: { userId } } },
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  // Verify user owns the tag
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, userId },
  });

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  return prisma.documentTag.create({
    data: { documentId, tagId },
  });
}

export async function removeTagFromDocument(
  documentId: string,
  tagId: string,
  userId: string,
) {
  const docTag = await prisma.documentTag.findFirst({
    where: {
      documentId,
      tagId,
      document: { folder: { vault: { userId } } },
    },
  });

  if (!docTag) {
    throw new ApiError(404, "Tag association not found");
  }

  return prisma.documentTag.delete({ where: { id: docTag.id } });
}

export async function getDocumentsByTag(tagId: string, userId: string) {
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, userId },
  });

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  return prisma.document.findMany({
    where: {
      tags: { some: { tagId } },
      folder: { vault: { userId } },
    },
    include: {
      tags: { include: { tag: true } },
      folder: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
