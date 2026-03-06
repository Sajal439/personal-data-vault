import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createTagController,
  getTagsController,
  deleteTagController,
  addTagToDocumentController,
  removeTagFromDocumentController,
  getDocumentsByTagController,
} from "../controllers/tag.controller.js";

export default async function tagRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: authMiddleware }, createTagController);

  app.get("/", { preHandler: authMiddleware }, getTagsController);

  app.delete("/:id", { preHandler: authMiddleware }, deleteTagController);

  // Document-Tag association
  app.post(
    "/:tagId/document/:documentId",
    { preHandler: authMiddleware },
    addTagToDocumentController,
  );

  app.delete(
    "/:tagId/document/:documentId",
    { preHandler: authMiddleware },
    removeTagFromDocumentController,
  );

  // Get documents by tag
  app.get(
    "/:tagId/documents",
    { preHandler: authMiddleware },
    getDocumentsByTagController,
  );
}
