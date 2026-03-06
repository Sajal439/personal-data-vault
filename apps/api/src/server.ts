import "dotenv/config";
import Fastify, { FastifyError } from "fastify";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import authRoutes from "./routes/auth.route.js";
import vaultRoutes from "./routes/vault.route.js";
import folderRoutes from "./routes/folder.route.js";
import documentRoutes from "./routes/document.route.js";
import tagRoutes from "./routes/tag.route.js";
import searchRoutes from "./routes/search.route.js";
import shareRoutes from "./routes/share.route.js";
import profileRoutes from "./routes/profile.route.js";
import { ensureBucket } from "./services/storage.service.js";

const server = Fastify({
  logger: true,
  trustProxy: true,
});

// ─── Global Error Handler ────────────────────────────────────────
server.setErrorHandler((error: FastifyError, request, reply) => {
  server.log.error(error);

  const statusCode = error.statusCode || 500;

  reply.status(statusCode).send({
    success: false,
    message: error.message || "Internal Server Error",
  });
});

// ─── Plugins ─────────────────────────────────────────────────────

server.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
});

server.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

server.register(multipart, {
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
});

// ─── Health Check ────────────────────────────────────────────────

server.get("/health", async () => {
  return {
    status: "ok",
    uptime: process.uptime(),
  };
});

// ─── Routes ──────────────────────────────────────────────────────

server.register(authRoutes, { prefix: "/auth" });
server.register(profileRoutes, { prefix: "/profile" });
server.register(vaultRoutes, { prefix: "/vault" });
server.register(folderRoutes, { prefix: "/folder" });
server.register(documentRoutes, { prefix: "/document" });
server.register(tagRoutes, { prefix: "/tag" });
server.register(searchRoutes, { prefix: "/search" });
server.register(shareRoutes, { prefix: "/share" });

// ─── Start Server ────────────────────────────────────────────────

const start = async () => {
  try {
    // Ensure storage bucket exists before accepting requests
    await ensureBucket();

    const port = Number(process.env.API_PORT) || 4000;

    await server.listen({
      port,
      host: "0.0.0.0",
    });

    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
