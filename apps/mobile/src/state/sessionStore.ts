import { AuthSession } from "../types/api";

type SessionListener = (session: AuthSession | null) => void;

let currentSession: AuthSession | null = null;
const listeners = new Set<SessionListener>();
let unauthorizedHandler: (() => void | Promise<void>) | null = null;

function emit() {
  listeners.forEach((listener) => listener(currentSession));
}

export const sessionStore = {
  getSession: () => currentSession,
  setSession: (session: AuthSession | null) => {
    currentSession = session;
    emit();
  },
  clearSession: async (notifyUnauthorized = false) => {
    currentSession = null;
    emit();

    if (notifyUnauthorized && unauthorizedHandler) {
      await unauthorizedHandler();
    }
  },
  subscribe: (listener: SessionListener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  setUnauthorizedHandler: (handler: (() => void | Promise<void>) | null) => {
    unauthorizedHandler = handler;
  },
};

