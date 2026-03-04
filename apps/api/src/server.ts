import "dotenv/config";
import Fastify from "fastify";
import authRoutes from "./routes/auth.route";

const server = Fastify();

server.get("/health", async () => {
  return { status: "ok" };
});

server.register(authRoutes, { prefix: "/auth" });

server.listen({ port: 4000 });
