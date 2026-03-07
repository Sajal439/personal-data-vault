import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
  DefaultTheme,
  NavigationContainer,
  Theme as NavigationTheme,
} from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { appTheme } from "../theme/theme";
import { AppLockScreen } from "../screens/auth/AppLockScreen";
import { AppNavigator } from "./AppNavigator";
import { AuthNavigator } from "./AuthNavigator";

const navigationTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: appTheme.colors.background,
    card: appTheme.colors.surface,
    primary: appTheme.colors.primary,
    text: appTheme.colors.onSurface,
    border: appTheme.colors.outlineVariant,
  },
};

export function RootNavigator() {
  const { session, isBootstrapping, isLocked } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={appTheme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {!session ? <AuthNavigator /> : isLocked ? <AppLockScreen /> : <AppNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: appTheme.colors.background,
  },
});

