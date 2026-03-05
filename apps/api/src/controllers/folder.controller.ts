import z from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  createFolder,
  deleteFolder,
  getVaultFolders,
} from "../services/folder.service.js";
import { apiResponse } from "../utils/apiResponse.js";

const createFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
});

export const createFolderController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { vaultId } = req.params as { vaultId: string };
    const { name, parentId } = createFolderSchema.parse(req.body);
    const userId = req.user!.userId;

    const folder = await createFolder(userId, vaultId, name, parentId);

    return reply
      .status(201)
      .send(apiResponse(folder, "Folder created successfully"));
  },
);

export const getFolderController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { vaultId } = req.params as { vaultId: string };
    const userId = req.user!.userId;
    const folders = await getVaultFolders(vaultId, userId);
    return reply
      .status(200)
      .send(apiResponse(folders, "Folders fetched successfully"));
  },
);

export const deleteFolderController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    const folder = await deleteFolder(id, userId);

    return reply
      .status(200)
      .send(apiResponse(folder, "Folder deleted successfully"));
  },
);
