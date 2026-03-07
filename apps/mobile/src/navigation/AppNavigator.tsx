import React from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DashboardScreen } from "../screens/main/DashboardScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { RemindersScreen } from "../screens/reminders/RemindersScreen";
import { SearchScreen } from "../screens/search/SearchScreen";
import { DocumentDetailsScreen } from "../screens/vault/DocumentDetailsScreen";
import { FolderDocumentsScreen } from "../screens/vault/FolderDocumentsScreen";
import { VaultDetailScreen } from "../screens/vault/VaultDetailScreen";
import { VaultsScreen } from "../screens/vault/VaultsScreen";
import { MainTabParamList, VaultStackParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();
const VaultStack = createNativeStackNavigator<VaultStackParamList>();

function VaultStackNavigator() {
  return (
    <VaultStack.Navigator
      initialRouteName="Vaults"
      screenOptions={{
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <VaultStack.Screen
        name="Vaults"
        component={VaultsScreen}
        options={{ title: "Vaults" }}
      />
      <VaultStack.Screen
        name="VaultDetail"
        component={VaultDetailScreen}
        options={({ route }) => ({
          title: route.params.vaultName,
        })}
      />
      <VaultStack.Screen
        name="FolderDocuments"
        component={FolderDocumentsScreen}
        options={({ route }) => ({
          title: route.params.folderName,
        })}
      />
      <VaultStack.Screen
        name="DocumentDetails"
        component={DocumentDetailsScreen}
        options={({ route }) => ({
          title: route.params.documentTitle || "Document",
        })}
      />
    </VaultStack.Navigator>
  );
}

function tabIcon(
  iconName: string,
  color: string,
  size: number,
  focused: boolean,
) {
  return (
    <MaterialCommunityIcons
      name={focused ? iconName : `${iconName}-outline`}
      color={color}
      size={size}
    />
  );
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1565C0",
        tabBarInactiveTintColor: "#718096",
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size, focused }) =>
            tabIcon("home", color, size, focused),
        }}
      />
      <Tab.Screen
        name="Vault"
        component={VaultStackNavigator}
        options={{
          tabBarIcon: ({ color, size, focused }) =>
            tabIcon("folder", color, size, focused),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) =>
            tabIcon("magnify", color, size, focused),
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) =>
            tabIcon("bell", color, size, focused),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) =>
            tabIcon("account", color, size, focused),
        }}
      />
    </Tab.Navigator>
  );
}

