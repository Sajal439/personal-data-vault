import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/format";

export function AppLockScreen() {
  const { unlockWithBiometrics, signOut } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onUnlock() {
    setError("");
    setLoading(true);

    try {
      await unlockWithBiometrics();
    } catch (unlockError) {
      setError(getErrorMessage(unlockError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Vault Locked</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Authenticate to continue
      </Text>

      {error ? (
        <Text variant="bodySmall" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="fingerprint"
          onPress={onUnlock}
          loading={loading}
          disabled={loading}
        >
          Unlock with Biometrics
        </Button>
        <Button mode="text" onPress={signOut}>
          Sign out
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F5F7FA",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    opacity: 0.75,
  },
  actions: {
    width: "100%",
    maxWidth: 320,
    gap: 10,
  },
  error: {
    color: "#B00020",
    marginBottom: 12,
  },
});

