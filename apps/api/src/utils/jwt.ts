import jwt from "jsonwebtoken";
import type { JwtPayload } from "@repo/types";
import { config } from "@repo/config";

const JWT_SECRET = config.jwtSecret;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not defined");
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
