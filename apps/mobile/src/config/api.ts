import { NativeModules, Platform } from "react-native";

function resolveApiHost() {
  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  const match = scriptURL?.match(/\/\/([^/:]+):\d+/);

  if (match?.[1]) {
    const host = match[1];
    if (Platform.OS === "android" && (host === "localhost" || host === "127.0.0.1")) {
      return "10.0.2.2";
    }
    return host;
  }

  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
}

const API_PORT = "4000";

export const API_BASE_URL = `http://${resolveApiHost()}:${API_PORT}`;
