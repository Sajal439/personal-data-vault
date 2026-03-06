import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  uploadDocumentController,
  getDocumentsController,
  getDocumentController,
  downloadDocumentController,
  deleteDocumentController,
} from "../controllers/document.controller.js";

export default async function documentRoutes(app: FastifyInstance) {
  // Upload a document to a folder
  app.post("/upload", { preHandler: authMiddleware }, uploadDocumentController);

  // List documents in a folder
  app.get(
    "/folder/:folderId",
    { preHandler: authMiddleware },
    getDocumentsController,
  );

  // Get single document metadata
  app.get("/:id", { preHandler: authMiddleware }, getDocumentController);

  // Download (decrypt + stream) a document
  app.get(
    "/:id/download",
    { preHandler: authMiddleware },
    downloadDocumentController,
  );

  // Delete a document
  app.delete("/:id", { preHandler: authMiddleware }, deleteDocumentController);
}
