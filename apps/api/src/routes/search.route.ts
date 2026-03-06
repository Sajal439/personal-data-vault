import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { searchController } from "../controllers/search.controller.js";

export default async function searchRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: authMiddleware }, searchController);
}
