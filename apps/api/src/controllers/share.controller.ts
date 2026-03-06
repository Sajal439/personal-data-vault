import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import {
  createShareLink,
  getShareLinkByToken,
  getShareLinksForDocument,
  revokeShareLink,
  logAccess,
  getAccessLogs,
} from "../services/share.service.js";
import { getFileStream } from "../services/storage.service.js";
import {
  decryptBuffer,
  streamToBuffer,
} from "../services/encryption.service.js";

const createShareSchema = z.object({
  documentId: z.string().uuid(),
  expiresInHours: z.number().min(1).max(720).default(24),
  permission: z.enum(["VIEW_ONLY", "DOWNLOAD"]).default("VIEW_ONLY"),
  maxAccesses: z.number().int().positive().optional(),
});

/**
 * Create a share link for a document (authenticated).
 */
export const createShareLinkController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { documentId, expiresInHours, permission, maxAccesses } =
      createShareSchema.parse(req.body);
    const userId = req.user!.userId;

    const link = await createShareLink(
      documentId,
      userId,
      expiresInHours,
      permission,
      maxAccesses,
    );

    return reply
      .status(201)
      .send(apiResponse(link, "Share link created successfully"));
  },
);

/**
 * List active share links for a document (authenticated).
 */
export const getShareLinksController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { documentId } = req.params as { documentId: string };
    const userId = req.user!.userId;

    const links = await getShareLinksForDocument(documentId, userId);

    return reply
      .status(200)
      .send(apiResponse(links, "Share links fetched successfully"));
  },
);

/**
 * Revoke a share link (authenticated).
 */
export const revokeShareLinkController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    await revokeShareLink(id, userId);

    return reply
      .status(200)
      .send(apiResponse(null, "Share link revoked successfully"));
  },
);

/**
 * Get access logs for a document (authenticated).
 */
export const getAccessLogsController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { documentId } = req.params as { documentId: string };
    const userId = req.user!.userId;

    const logs = await getAccessLogs(documentId, userId);

    return reply
      .status(200)
      .send(apiResponse(logs, "Access logs fetched successfully"));
  },
);

/**
 * View shared document metadata via public token (no auth required).
 */
export const viewSharedDocumentController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const { token } = req.params as { token: string };

  const link = await getShareLinkByToken(token);

  // Log the access
  await logAccess(
    link.documentId,
    link.id,
    req.ip,
    req.headers["user-agent"] || undefined,
  );

  return reply.status(200).send(
    apiResponse(
      {
        title: link.document.title,
        mimeType: link.document.mimeType,
        size: link.document.size,
        permission: link.permission,
        expiresAt: link.expiresAt,
      },
      "Shared document info",
    ),
  );
};

/**
 * Download shared document via public token (no auth required).
 * Only works if permission is DOWNLOAD.
 */
export const downloadSharedDocumentController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const { token } = req.params as { token: string };

  const link = await getShareLinkByToken(token);

  if (link.permission !== "DOWNLOAD") {
    return reply.status(403).send({
      success: false,
      message: "This share link does not allow downloads",
    });
  }

  // Log the access
  await logAccess(
    link.documentId,
    link.id,
    req.ip,
    req.headers["user-agent"] || undefined,
  );

  const doc = link.document;

  // Get encrypted file from MinIO
  const encryptedStream = await getFileStream(doc.fileKey);
  const encryptedBuffer = await streamToBuffer(encryptedStream);

  let responseBuffer: Buffer;

  if (doc.encrypted && doc.encryptionIv && doc.encryptionTag) {
    responseBuffer = decryptBuffer(
      encryptedBuffer,
      doc.encryptionIv,
      doc.encryptionTag,
    );
  } else {
    responseBuffer = encryptedBuffer;
  }

  return reply
    .header("Content-Type", doc.mimeType)
    .header("Content-Disposition", `attachment; filename="${doc.title}"`)
    .header("Content-Length", responseBuffer.length)
    .send(responseBuffer);
};
