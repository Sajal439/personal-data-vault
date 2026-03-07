import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SignInScreen } from "../screens/auth/SignInScreen";
import { SignUpScreen } from "../screens/auth/SignUpScreen";
import { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

