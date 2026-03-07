import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { AuthStackParamList } from "../../navigation/types";
import { getErrorMessage } from "../../utils/format";

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

export function SignInScreen({ navigation }: Props) {
  const { signIn, loginWithBiometrics, biometricLoginAvailable } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit() {
    setError("");
    setSubmitting(true);

    try {
      await signIn({
        email: email.trim(),
        password,
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  async function onBiometricLogin() {
    setError("");
    setSubmitting(true);

    try {
      await loginWithBiometrics();
    } catch (biometricError) {
      setError(getErrorMessage(biometricError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.centered}>
        <Text variant="headlineMedium">Personal Data OS</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Encrypted vault for your life documents
        </Text>

        <Surface style={styles.form} elevation={1}>
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <Text style={styles.errorText} variant="bodySmall">
              {error}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={onSubmit}
            loading={submitting}
            disabled={submitting || !email || !password}
          >
            Sign In
          </Button>

          {biometricLoginAvailable ? (
            <Button
              mode="outlined"
              icon="fingerprint"
              onPress={onBiometricLogin}
              disabled={submitting}
            >
              Use Biometric Login
            </Button>
          ) : null}

          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text variant="bodyMedium" style={styles.linkText}>
              Create an account
            </Text>
          </TouchableOpacity>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  subtitle: {
    opacity: 0.8,
    marginTop: 4,
    marginBottom: 16,
  },
  form: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  errorText: {
    color: "#B00020",
  },
  linkText: {
    textAlign: "center",
    marginTop: 4,
    color: "#1565C0",
    fontWeight: "600",
  },
});

