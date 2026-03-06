import crypto from "node:crypto";
import { prisma } from "@repo/db";
import { ApiError } from "../utils/apiError.js";

/**
 * Create a time-limited share link for a document.
 */
export async function createShareLink(
  documentId: string,
  userId: string,
  expiresInHours: number,
  permission: "VIEW_ONLY" | "DOWNLOAD" = "VIEW_ONLY",
  maxAccesses?: number,
) {
  // Verify user owns the document
  const document = await prisma.document.findFirst({
    where: { id: documentId, folder: { vault: { userId } } },
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  return prisma.shareLink.create({
    data: {
      documentId,
      permission,
      maxAccesses: maxAccesses ?? null,
      expiresAt,
    },
  });
}

/**
 * Retrieve and validate a share link by its public token.
 */
export async function getShareLinkByToken(token: string) {
  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      document: true,
      _count: { select: { accessLogs: true } },
    },
  });

  if (!link) {
    throw new ApiError(404, "Share link not found");
  }

  if (link.revokedAt) {
    throw new ApiError(410, "Share link has been revoked");
  }

  if (new Date() > link.expiresAt) {
    throw new ApiError(410, "Share link has expired");
  }

  if (link.maxAccesses && link._count.accessLogs >= link.maxAccesses) {
    throw new ApiError(410, "Share link has reached maximum access limit");
  }

  return link;
}

/**
 * List all active share links for a document (owned by user).
 */
export async function getShareLinksForDocument(
  documentId: string,
  userId: string,
) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, folder: { vault: { userId } } },
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  return prisma.shareLink.findMany({
    where: { documentId, revokedAt: null },
    include: { _count: { select: { accessLogs: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Revoke a share link.
 */
export async function revokeShareLink(shareLinkId: string, userId: string) {
  const link = await prisma.shareLink.findFirst({
    where: {
      id: shareLinkId,
      document: { folder: { vault: { userId } } },
    },
  });

  if (!link) {
    throw new ApiError(404, "Share link not found");
  }

  return prisma.shareLink.update({
    where: { id: shareLinkId },
    data: { revokedAt: new Date() },
  });
}

/**
 * Log an access to a share link.
 */
export async function logAccess(
  documentId: string,
  shareLinkId: string,
  ipAddress?: string,
  userAgent?: string,
) {
  return prisma.accessLog.create({
    data: { documentId, shareLinkId, ipAddress, userAgent },
  });
}

/**
 * Get access logs for a document (owned by user).
 */
export async function getAccessLogs(documentId: string, userId: string) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, folder: { vault: { userId } } },
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  return prisma.accessLog.findMany({
    where: { documentId },
    orderBy: { accessedAt: "desc" },
  });
}
