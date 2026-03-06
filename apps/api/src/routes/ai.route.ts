import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  processDocumentController,
  assistantChatController,
} from "../controllers/ai.controller.js";

export default async function aiRoutes(app: FastifyInstance) {
  app.post(
    "/document/:id/process",
    { preHandler: authMiddleware },
    processDocumentController,
  );
  app.post("/chat", { preHandler: authMiddleware }, assistantChatController);
}
