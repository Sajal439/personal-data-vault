import z from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  createVault,
  deleteVault,
  getVaults,
} from "../services/vault.service.js";
import { apiResponse } from "../utils/apiResponse.js";

const createVaultSchema = z.object({
  name: z.string().min(1),
});

export const createVaultController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { name } = createVaultSchema.parse(req.body);
    const userId = req.user!.userId;
    const vault = await createVault(userId, name);

    return reply
      .status(201)
      .send(apiResponse(vault, "Vault created successfully"));
  },
);

export const getVaultsController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user!.userId;
    const vaults = await getVaults(userId);

    return reply
      .status(200)
      .send(apiResponse(vaults, "Vaults fetched successfully"));
  },
);

export const deleteVaultController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    await deleteVault(userId, id);

    return reply.send(apiResponse(null, "Vault deleted successfully"));
  },
);
