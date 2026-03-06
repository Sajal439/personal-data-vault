import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import {
  createTag,
  getUserTags,
  deleteTag,
  addTagToDocument,
  removeTagFromDocument,
  getDocumentsByTag,
} from "../services/tag.service.js";

const createTagSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createTagController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { name } = createTagSchema.parse(req.body);
    const userId = req.user!.userId;

    const tag = await createTag(userId, name);

    return reply.status(201).send(apiResponse(tag, "Tag created successfully"));
  },
);

export const getTagsController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user!.userId;
    const tags = await getUserTags(userId);

    return reply
      .status(200)
      .send(apiResponse(tags, "Tags fetched successfully"));
  },
);

export const deleteTagController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    await deleteTag(id, userId);

    return reply.status(200).send(apiResponse(null, "Tag deleted"));
  },
);

export const addTagToDocumentController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { tagId, documentId } = req.params as {
      tagId: string;
      documentId: string;
    };
    const userId = req.user!.userId;

    const result = await addTagToDocument(documentId, tagId, userId);

    return reply.status(201).send(apiResponse(result, "Tag added to document"));
  },
);

export const removeTagFromDocumentController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { tagId, documentId } = req.params as {
      tagId: string;
      documentId: string;
    };
    const userId = req.user!.userId;

    await removeTagFromDocument(documentId, tagId, userId);

    return reply
      .status(200)
      .send(apiResponse(null, "Tag removed from document"));
  },
);

export const getDocumentsByTagController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { tagId } = req.params as { tagId: string };
    const userId = req.user!.userId;

    const documents = await getDocumentsByTag(tagId, userId);

    return reply
      .status(200)
      .send(apiResponse(documents, "Documents fetched by tag"));
  },
);
