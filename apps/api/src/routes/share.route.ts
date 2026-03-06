import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createShareLinkController,
  getShareLinksController,
  revokeShareLinkController,
  getAccessLogsController,
  viewSharedDocumentController,
  downloadSharedDocumentController,
} from "../controllers/share.controller.js";

export default async function shareRoutes(app: FastifyInstance) {
  // ─── Authenticated Routes ───────────────────────────────────────

  // Create a share link
  app.post("/", { preHandler: authMiddleware }, createShareLinkController);

  // List share links for a document
  app.get(
    "/document/:documentId",
    { preHandler: authMiddleware },
    getShareLinksController,
  );

  // Revoke a share link
  app.delete("/:id", { preHandler: authMiddleware }, revokeShareLinkController);

  // Get access logs for a document
  app.get(
    "/document/:documentId/logs",
    { preHandler: authMiddleware },
    getAccessLogsController,
  );

  // ─── Public Routes (no auth) ───────────────────────────────────

  // View shared document metadata
  app.get("/public/:token", viewSharedDocumentController);

  // Download shared document
  app.get("/public/:token/download", downloadSharedDocumentController);
}
