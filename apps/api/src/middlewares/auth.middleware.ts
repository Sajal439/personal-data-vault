import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new ApiError(401, "Authorization header missing");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Invalid token format");
  }

  try {
    const payload = verifyToken(token);

    req.user = payload;
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}
