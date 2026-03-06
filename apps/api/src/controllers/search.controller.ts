import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { searchDocuments } from "../services/document.service.js";

export const searchController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { q } = req.query as { q?: string };
    const userId = req.user!.userId;

    if (!q || q.trim().length === 0) {
      throw new ApiError(400, "Search query is required");
    }

    const results = await searchDocuments(userId, q.trim());

    return reply
      .status(200)
      .send(apiResponse(results, `Found ${results.length} result(s)`));
  },
);
