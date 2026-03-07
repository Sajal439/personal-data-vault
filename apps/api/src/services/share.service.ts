import { prisma, Prisma } from "@repo/db";
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

  if (link.maxAccesses !== null) {
    const accessCount = await prisma.accessLog.count({
      where: { shareLinkId: link.id },
    });

    if (accessCount >= link.maxAccesses) {
      throw new ApiError(410, "Share link has reached maximum access limit");
    }
  }

  return link;
}

async function withSerializableRetry<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  maxRetries = 2,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await prisma.$transaction(
        (tx) => operation(tx),
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < maxRetries
      ) {
        attempt += 1;
        continue;
      }

      throw error;
    }
  }
}

async function assertShareLinkAccessAllowedInTx(
  tx: Prisma.TransactionClient,
  shareLinkId: string,
  documentId: string,
) {
  const link = await tx.shareLink.findUnique({
    where: { id: shareLinkId },
    select: {
      id: true,
      documentId: true,
      maxAccesses: true,
      expiresAt: true,
      revokedAt: true,
    },
  });

  if (!link || link.documentId !== documentId) {
    throw new ApiError(404, "Share link not found");
  }

  if (link.revokedAt) {
    throw new ApiError(410, "Share link has been revoked");
  }

  if (new Date() > link.expiresAt) {
    throw new ApiError(410, "Share link has expired");
  }

  if (link.maxAccesses !== null) {
    const accessCount = await tx.accessLog.count({
      where: { shareLinkId },
    });

    if (accessCount >= link.maxAccesses) {
      throw new ApiError(410, "Share link has reached maximum access limit");
    }
  }
}

/**
 * Log an access to a share link (serialized to prevent maxAccesses races).
 */
export async function logAccess(
  documentId: string,
  shareLinkId: string,
  ipAddress?: string,
  userAgent?: string,
) {
  return withSerializableRetry(async (tx) => {
    await assertShareLinkAccessAllowedInTx(tx, shareLinkId, documentId);

    return tx.accessLog.create({
      data: { documentId, shareLinkId, ipAddress, userAgent },
    });
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
