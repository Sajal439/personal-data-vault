import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createFolderController,
  deleteFolderController,
  getFolderController,
} from "../controllers/folder.controller.js";

export default async function folderRoutes(app: FastifyInstance) {
  app.post(
    "/vault/:vaultId/folder",
    { preHandler: authMiddleware },
    createFolderController,
  );

  app.get(
    "/vault/:vaultId/folder",
    { preHandler: authMiddleware },
    getFolderController,
  );

  app.delete("/:id", { preHandler: authMiddleware }, deleteFolderController);
}
