import bcrypt from "bcrypt";
import { prisma } from "@repo/db";
import { signToken } from "../utils/jwt.js";
import { AuthResponse } from "@repo/types";
import { ApiError } from "../utils/apiError.js";

export async function signup(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  const token = signToken({
    userId: user.id,
  });

  return {
    token,
    user,
  };
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, "Email already Registered");
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = signToken({
    userId: user.id,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}
