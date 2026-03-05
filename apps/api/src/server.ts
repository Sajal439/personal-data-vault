import "dotenv/config";
import Fastify, { FastifyError } from "fastify";
import rateLimit from "@fastify/rate-limit";

import authRoutes from "./routes/auth.route.js";
import vaultRoutes from "./routes/vault.route.js";
import folderRoutes from "./routes/folder.route.js";

const server = Fastify({
  logger: true,
  trustProxy: true,
});

// Global Error Handler
server.setErrorHandler((error: FastifyError, request, reply) => {
  server.log.error(error);

  const statusCode = error.statusCode || 500;

  reply.status(statusCode).send({
    success: false,
    message: error.message || "Internal Server Error",
  });
});

// Rate Limiting
server.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Health Check
server.get("/health", async () => {
  return {
    status: "ok",
    uptime: process.uptime(),
  };
});

// Routes
server.register(authRoutes, { prefix: "/auth" });
server.register(vaultRoutes, { prefix: "/vault" });
server.register(folderRoutes, { prefix: "/folder" });

const start = async () => {
  try {
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
