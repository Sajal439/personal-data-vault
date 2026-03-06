import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  saveIntegrationController,
  getIntegrationsController,
  deleteIntegrationController,
} from "../controllers/integration.controller.js";

export default async function integrationRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: authMiddleware }, saveIntegrationController);
  app.get("/", { preHandler: authMiddleware }, getIntegrationsController);
  app.delete(
    "/:id",
    { preHandler: authMiddleware },
    deleteIntegrationController,
  );
}
