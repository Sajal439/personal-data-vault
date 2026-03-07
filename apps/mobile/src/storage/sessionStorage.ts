import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Keychain from "react-native-keychain";
import { AuthSession } from "../types/api";

const SESSION_KEY = "pdo.auth.session.v1";
const CREDENTIALS_SERVICE = "pdo.auth.credentials.v1";

export async function saveSession(session: AuthSession) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function saveLoginCredentials(email: string, password: string) {
  await Keychain.setGenericPassword(email, password, {
    service: CREDENTIALS_SERVICE,
  });
}

export async function loadLoginCredentials() {
  const result = await Keychain.getGenericPassword({
    service: CREDENTIALS_SERVICE,
  });

  if (!result) {
    return null;
  }

  return { email: result.username, password: result.password };
}

export async function clearLoginCredentials() {
  await Keychain.resetGenericPassword({ service: CREDENTIALS_SERVICE });
}

