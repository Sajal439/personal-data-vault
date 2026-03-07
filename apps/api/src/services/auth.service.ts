import bcrypt from "bcrypt";
import { prisma } from "@repo/db";
import { signRefreshToken, signToken, verifyRefreshToken } from "../utils/jwt.js";
import { AuthResponse, RefreshTokenResponse } from "@repo/types";
import { ApiError } from "../utils/apiError.js";

function createAuthTokens(userId: string) {
  const token = signToken({ userId });
  const refreshToken = signRefreshToken({ userId });

  return { token, refreshToken };
}

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

  const { token, refreshToken } = createAuthTokens(user.id);

  return {
    token,
    refreshToken,
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
    throw new ApiError(401, "Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { token, refreshToken } = createAuthTokens(user.id);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}

export async function refreshAuthToken(
  refreshToken: string,
): Promise<RefreshTokenResponse> {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const nextTokens = createAuthTokens(user.id);

  return nextTokens;
}
