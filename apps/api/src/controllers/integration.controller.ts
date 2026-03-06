import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { z } from "zod";
import { IntegrationProvider } from "@prisma/client";
import {
  saveIntegration,
  getUserIntegrations,
  deleteIntegration,
} from "../services/integration.service.js";

const saveIntegrationSchema = z.object({
  provider: z.nativeEnum(IntegrationProvider),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
});

export const saveIntegrationController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { provider, accessToken, refreshToken } = saveIntegrationSchema.parse(
      req.body,
    );
    const userId = req.user!.userId;

    const integration = await saveIntegration(
      userId,
      provider,
      accessToken,
      refreshToken,
    );

    return reply
      .status(200)
      .send(apiResponse(integration, "Integration saved successfully"));
  },
);

export const getIntegrationsController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user!.userId;
    const integrations = await getUserIntegrations(userId);

    return reply
      .status(200)
      .send(apiResponse(integrations, "Integrations fetched successfully"));
  },
);

export const deleteIntegrationController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    await deleteIntegration(id, userId);

    return reply
      .status(200)
      .send(apiResponse(null, "Integration deleted successfully"));
  },
);
