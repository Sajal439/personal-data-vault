import { API_BASE_URL } from "../config/api";
import { sessionStore } from "../state/sessionStore";
import { saveSession } from "../storage/sessionStorage";
import { ApiEnvelope, AuthSession } from "../types/api";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  isMultipart?: boolean;
  retryOnAuthError?: boolean;
}

export class ApiClientError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown = null) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

let refreshingPromise: Promise<AuthSession | null> | null = null;

async function refreshTokens() {
  if (refreshingPromise) {
    return refreshingPromise;
  }

  const session = sessionStore.getSession();
  if (!session?.refreshToken) {
    return null;
  }

  refreshingPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });

      const payload = (await response.json()) as ApiEnvelope<{
        token: string;
        refreshToken: string;
      }>;

      if (!response.ok || !payload.success) {
        await sessionStore.clearSession(true);
        return null;
      }

      const nextSession: AuthSession = {
        ...session,
        token: payload.data.token,
        refreshToken: payload.data.refreshToken,
      };

      sessionStore.setSession(nextSession);
      await saveSession(nextSession);

      return nextSession;
    } catch {
      await sessionStore.clearSession(true);
      return null;
    } finally {
      refreshingPromise = null;
    }
  })();

  return refreshingPromise;
}

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parsePayload(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    requiresAuth = true,
    isMultipart = false,
    retryOnAuthError = true,
  } = options;

  const session = sessionStore.getSession();
  const requestHeaders: Record<string, string> = { ...headers };

  if (!isMultipart) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (requiresAuth && session?.token) {
    requestHeaders.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : isMultipart
          ? (body as BodyInit)
          : JSON.stringify(body),
  });

  if (response.status === 401 && requiresAuth && retryOnAuthError) {
    const refreshed = await refreshTokens();

    if (refreshed) {
      return request<T>(path, {
        ...options,
        retryOnAuthError: false,
      });
    }
  }

  const payload = await parsePayload(response);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: string }).message)
        : `Request failed with status ${response.status}`;

    throw new ApiClientError(response.status, message, payload);
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as ApiEnvelope<T>;

    if (!envelope.success) {
      throw new ApiClientError(400, envelope.message, envelope);
    }

    return envelope.data;
  }

  return payload as T;
}

