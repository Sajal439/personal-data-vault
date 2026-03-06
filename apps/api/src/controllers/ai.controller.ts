import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { z } from "zod";
import { processDocumentWithAI, askAssistant } from "../services/ai.service.js";

const chatSchema = z.object({
  query: z.string().min(1),
});

export const processDocumentController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    const doc = await processDocumentWithAI(id, userId);

    return reply
      .status(200)
      .send(apiResponse(doc, "Document processed successfully"));
  },
);

export const assistantChatController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { query } = chatSchema.parse(req.body);
    const userId = req.user!.userId;

    const answer = await askAssistant(userId, query);

    return reply.status(200).send(apiResponse({ answer }, "Success"));
  },
);
