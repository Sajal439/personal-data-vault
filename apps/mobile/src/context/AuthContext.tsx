import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState } from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import { authApi } from "../api/authApi";
import { sessionStore } from "../state/sessionStore";
import {
  clearLoginCredentials,
  clearSession,
  loadLoginCredentials,
  loadSession,
  saveLoginCredentials,
  saveSession,
} from "../storage/sessionStorage";
import { AuthSession } from "../types/api";

interface SignInPayload {
  email: string;
  password: string;
}

interface AuthContextValue {
  session: AuthSession | null;
  isBootstrapping: boolean;
  isLocked: boolean;
  biometricSupported: boolean;
  biometricLoginAvailable: boolean;
  signIn: (payload: SignInPayload) => Promise<void>;
  signUp: (payload: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
  unlockWithBiometrics: () => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  clearBiometricCredentials: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const biometrics = new ReactNativeBiometrics();

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricLoginAvailable, setBiometricLoginAvailable] = useState(false);

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe((nextSession) => {
      setSession(nextSession);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    sessionStore.setUnauthorizedHandler(async () => {
      await clearSession();
      setIsLocked(false);
      setSession(null);
    });

    return () => {
      sessionStore.setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" && session && biometricSupported) {
        setIsLocked(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [biometricSupported, session]);

  useEffect(() => {
    (async () => {
      try {
        const [persistedSession, sensorInfo, credentials] = await Promise.all([
          loadSession(),
          biometrics.isSensorAvailable(),
          loadLoginCredentials(),
        ]);

        const canUseBiometric = Boolean(sensorInfo.available);
        setBiometricSupported(canUseBiometric);
        setBiometricLoginAvailable(Boolean(credentials) && canUseBiometric);

        if (persistedSession) {
          sessionStore.setSession(persistedSession);
          setSession(persistedSession);
          setIsLocked(canUseBiometric);
        }
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  async function applySession(nextSession: AuthSession) {
    sessionStore.setSession(nextSession);
    setSession(nextSession);
    setIsLocked(false);
    await saveSession(nextSession);
  }

  async function signIn({ email, password }: SignInPayload) {
    const result = await authApi.login({ email, password });
    await applySession(result);
    await saveLoginCredentials(email, password);
    setBiometricLoginAvailable(biometricSupported);
  }

  async function signUp({ email, password }: SignInPayload) {
    const result = await authApi.signup({ email, password });
    await applySession(result);
    await saveLoginCredentials(email, password);
    setBiometricLoginAvailable(biometricSupported);
  }

  async function signOut() {
    sessionStore.setSession(null);
    setSession(null);
    setIsLocked(false);
    await clearSession();
  }

  async function unlockWithBiometrics() {
    if (!biometricSupported) {
      return;
    }

    const prompt = await biometrics.simplePrompt({
      promptMessage: "Unlock your Personal Data OS vault",
      cancelButtonText: "Cancel",
    });

    if (prompt.success) {
      setIsLocked(false);
    }
  }

  async function loginWithBiometrics() {
    if (!biometricSupported) {
      throw new Error("Biometric authentication is not available on this device");
    }

    const prompt = await biometrics.simplePrompt({
      promptMessage: "Continue with biometric authentication",
      cancelButtonText: "Cancel",
    });

    if (!prompt.success) {
      throw new Error("Biometric authentication was cancelled");
    }

    const credentials = await loadLoginCredentials();
    if (!credentials) {
      throw new Error("No biometric login credentials found");
    }

    await signIn(credentials);
  }

  async function clearBiometricCredentials() {
    await clearLoginCredentials();
    setBiometricLoginAvailable(false);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isBootstrapping,
      isLocked,
      biometricSupported,
      biometricLoginAvailable,
      signIn,
      signUp,
      signOut,
      unlockWithBiometrics,
      loginWithBiometrics,
      clearBiometricCredentials,
    }),
    [
      session,
      isBootstrapping,
      isLocked,
      biometricSupported,
      biometricLoginAvailable,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

