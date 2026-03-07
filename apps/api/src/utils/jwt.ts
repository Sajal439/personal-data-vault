import jwt from "jsonwebtoken";
import type { JwtPayload } from "@repo/types";
import { config } from "@repo/config";

const JWT_SECRET = config.jwtSecret;
const REFRESH_TOKEN_SECRET = config.refreshTokenSecret;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not defined");
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET not defined");
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
}
