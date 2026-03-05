import "dotenv/config";
import Fastify from "fastify";
import authRoutes from "./routes/auth.route.js";

const server = Fastify({ logger: true });

server.get("/health", async () => {
  return { status: "ok" };
});

server.register(authRoutes, { prefix: "/auth" });

server
  .listen({ port: 4000 })
  .then((address: string) => {
    console.log(`Server listening at ${address}`);
  })
  .catch((err: Error) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
