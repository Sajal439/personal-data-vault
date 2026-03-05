import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createVaultController,
  deleteVaultController,
  getVaultsController,
} from "../controllers/vault.controller.js";

export default async function vaultRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: authMiddleware }, createVaultController);

  app.get("/", { preHandler: authMiddleware }, getVaultsController);

  app.delete("/:id", { preHandler: authMiddleware }, deleteVaultController);
}
