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

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit() {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await signUp({ email: email.trim(), password });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
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
        <Text variant="headlineMedium">Create Account</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Start building your secure personal data vault
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
            label="Password (min 8 chars)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            mode="outlined"
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            disabled={submitting || !email || !password || !confirmPassword}
          >
            Create Account
          </Button>

          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text variant="bodyMedium" style={styles.linkText}>
              Already have an account? Sign in
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

