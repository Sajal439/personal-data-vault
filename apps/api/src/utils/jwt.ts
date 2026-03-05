import jwt from "jsonwebtoken";
import type { JwtPayload } from "@repo/types";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not defined");
}

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
