import bcrypt from "bcrypt";
import { prisma } from "@repo/db";
import { signToken } from "../utils/jwt";

export async function signup(email: string, password: string) {
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
    },
  });

  const token = signToken({ userId: user.id });

  return { user, token };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) throw new Error("Invalid credentials");

  const token = signToken({ userId: user.id });

  return { user, token };
}
