import { request } from "./httpClient";
import { AuthSession } from "../types/api";

interface CredentialsPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: (payload: CredentialsPayload) =>
    request<AuthSession>("/auth/login", {
      method: "POST",
      body: payload,
      requiresAuth: false,
    }),
  signup: (payload: CredentialsPayload) =>
    request<AuthSession>("/auth/signup", {
      method: "POST",
      body: payload,
      requiresAuth: false,
    }),
};

