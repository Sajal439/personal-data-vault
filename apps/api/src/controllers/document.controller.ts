import crypto from "node:crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import {
  createDocumentMetadata,
  getDocumentsByFolder,
  getDocumentById,
  deleteDocument,
} from "../services/document.service.js";
import {
  uploadFile,
  getFileStream,
  deleteFile,
} from "../services/storage.service.js";
import {
  encryptBuffer,
  decryptBuffer,
  streamToBuffer,
} from "../services/encryption.service.js";

/**
 * Upload a document — encrypt and store in MinIO.
 */
export const uploadDocumentController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const data = await req.file();

    if (!data) {
      throw new ApiError(400, "No file uploaded");
    }

    const { filename, mimetype, file } = data;
    const folderId = (data.fields.folderId as any)?.value;

    if (!folderId) {
      throw new ApiError(400, "folderId is required");
    }

    const userId = req.user!.userId;

    // Collect file stream into buffer
    const plainBuffer = await streamToBuffer(file);
    const fileSize = plainBuffer.length;

    // Encrypt the file
    const { encrypted, iv, authTag, algorithm } =
      await encryptBuffer(plainBuffer);

    // Generate a unique key for S3 storage
    const fileKey = `${userId}/${crypto.randomUUID()}-${filename}`;

    // Upload encrypted buffer to MinIO
    await uploadFile(fileKey, encrypted, mimetype, encrypted.length);

    // Save metadata to database
    const document = await createDocumentMetadata({
      title: filename,
      mimeType: mimetype,
      size: fileSize,
      folderId,
      fileKey,
      encrypted: true,
      encryptionIv: iv,
      encryptionAlgo: algorithm,
      encryptionTag: authTag,
    });

    return reply
      .status(201)
      .send(apiResponse(document, "Document uploaded successfully"));
  },
);

/**
 * List documents in a folder.
 */
export const getDocumentsController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { folderId } = req.params as { folderId: string };
    const userId = req.user!.userId;

    const documents = await getDocumentsByFolder(folderId, userId);

    return reply
      .status(200)
      .send(apiResponse(documents, "Documents fetched successfully"));
  },
);

/**
 * Get a single document's metadata.
 */
export const getDocumentController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    const document = await getDocumentById(id, userId);

    return reply
      .status(200)
      .send(apiResponse(document, "Document fetched successfully"));
  },
);

/**
 * Download a document — decrypt from MinIO and stream to client.
 */
export const downloadDocumentController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    const document = await getDocumentById(id, userId);

    // Get encrypted file from MinIO
    const encryptedStream = await getFileStream(document.fileKey);
    const encryptedBuffer = await streamToBuffer(encryptedStream);

    let responseBuffer: Buffer;

    if (document.encrypted && document.encryptionIv && document.encryptionTag) {
      // Decrypt the file
      responseBuffer = decryptBuffer(
        encryptedBuffer,
        document.encryptionIv,
        document.encryptionTag,
      );
    } else {
      responseBuffer = encryptedBuffer;
    }

    return reply
      .header("Content-Type", document.mimeType)
      .header("Content-Disposition", `attachment; filename="${document.title}"`)
      .header("Content-Length", responseBuffer.length)
      .send(responseBuffer);
  },
);

/**
 * Delete a document — remove from MinIO and database.
 */
export const deleteDocumentController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    const document = await deleteDocument(id, userId);

    // Remove file from MinIO (best-effort)
    await deleteFile(document.fileKey).catch(() => {});

    return reply
      .status(200)
      .send(apiResponse(null, "Document deleted successfully"));
  },
);
