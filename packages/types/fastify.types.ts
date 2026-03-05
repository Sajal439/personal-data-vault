import "fastify";
import { JwtPayload } from "./auth.types.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}
