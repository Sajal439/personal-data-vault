import React, { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Button,
  Card,
  Chip,
  Dialog,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import { integrationApi } from "../../api/integrationApi";
import { profileApi } from "../../api/profileApi";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SectionHeader } from "../../components/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { Integration, Profile } from "../../types/api";
import { formatDate, getErrorMessage } from "../../utils/format";

type Provider = "GOOGLE_DRIVE" | "DROPBOX";

const providerLabels: Record<Provider, string> = {
  GOOGLE_DRIVE: "Google Drive",
  DROPBOX: "Dropbox",
};

export function ProfileScreen() {
  const {
    signOut,
    biometricSupported,
    biometricLoginAvailable,
    clearBiometricCredentials,
  } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [snackbar, setSnackbar] = useState("");
  const [integrationDialogVisible, setIntegrationDialogVisible] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider>("GOOGLE_DRIVE");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [savingIntegration, setSavingIntegration] = useState(false);

  const connectedProviders = useMemo(
    () => new Set(integrations.map((item) => item.provider)),
    [integrations],
  );

  const loadProfileData = useCallback(async () => {
    try {
      const [profileData, integrationData] = await Promise.all([
        profileApi.getProfile(),
        integrationApi.getIntegrations(),
      ]);

      setProfile(profileData);
      setName(profileData.name || "");
      setBio(profileData.bio || "");
      setAvatarUrl(profileData.avatarUrl || "");
      setIntegrations(integrationData);
    } catch (loadError) {
      setSnackbar(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData]),
  );

  async function onSaveProfile() {
    setSavingProfile(true);
    try {
      const payload: { name?: string; bio?: string; avatarUrl?: string } = {};
      if (name.trim()) {
        payload.name = name.trim();
      }
      if (bio.trim()) {
        payload.bio = bio.trim();
      }
      if (avatarUrl.trim()) {
        payload.avatarUrl = avatarUrl.trim();
      }

      const updated = await profileApi.updateProfile(payload);
      setProfile(updated);
      setSnackbar("Profile updated");
    } catch (saveError) {
      setSnackbar(getErrorMessage(saveError));
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSaveIntegration() {
    if (!accessToken.trim()) {
      setSnackbar("Access token is required");
      return;
    }

    setSavingIntegration(true);
    try {
      await integrationApi.saveIntegration({
        provider: selectedProvider,
        accessToken: accessToken.trim(),
        refreshToken: refreshToken.trim() || undefined,
      });

      setAccessToken("");
      setRefreshToken("");
      setIntegrationDialogVisible(false);
      await loadProfileData();
      setSnackbar(`${providerLabels[selectedProvider]} connected`);
    } catch (saveError) {
      setSnackbar(getErrorMessage(saveError));
    } finally {
      setSavingIntegration(false);
    }
  }

  function onDisconnectProvider(provider: Provider) {
    const integration = integrations.find((item) => item.provider === provider);
    if (!integration) {
      return;
    }

    Alert.alert("Disconnect Integration", `Disconnect ${providerLabels[provider]}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: async () => {
          try {
            await integrationApi.deleteIntegration(integration.id);
            setIntegrations((current) =>
              current.filter((item) => item.id !== integration.id),
            );
            setSnackbar(`${providerLabels[provider]} disconnected`);
          } catch (disconnectError) {
            setSnackbar(getErrorMessage(disconnectError));
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenContainer>
        <Card>
          <Card.Content>
            <Text>Loading profile...</Text>
          </Card.Content>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <SectionHeader
        title="Profile & Settings"
        subtitle="Manage personal details, integrations, and account security"
      />

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.section}>
          <Text variant="titleMedium">{profile?.email || "User"}</Text>
          <Text variant="bodySmall" style={styles.muted}>
            Joined {formatDate(profile?.createdAt || null)}
          </Text>
          <TextInput mode="outlined" label="Name" value={name} onChangeText={setName} />
          <TextInput
            mode="outlined"
            label="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
          />
          <TextInput
            mode="outlined"
            label="Avatar URL"
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            autoCapitalize="none"
          />
          <Button mode="contained" loading={savingProfile} onPress={onSaveProfile}>
            Save Profile
          </Button>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.section}>
          <View style={styles.integrationHeader}>
            <Text variant="titleMedium">Integrations</Text>
            <Button
              mode="contained-tonal"
              icon="plus"
              onPress={() => setIntegrationDialogVisible(true)}
            >
              Connect
            </Button>
          </View>

          {(["GOOGLE_DRIVE", "DROPBOX"] as Provider[]).map((provider) => {
            const connected = connectedProviders.has(provider);
            return (
              <Card key={provider} mode="contained">
                <Card.Content style={styles.integrationRow}>
                  <Text variant="titleSmall">{providerLabels[provider]}</Text>
                  <View style={styles.integrationActions}>
                    <Chip compact>{connected ? "Connected" : "Not Connected"}</Chip>
                    {connected ? (
                      <Button mode="text" onPress={() => onDisconnectProvider(provider)}>
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        mode="text"
                        onPress={() => {
                          setSelectedProvider(provider);
                          setIntegrationDialogVisible(true);
                        }}
                      >
                        Connect
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.section}>
          <Text variant="titleMedium">Security</Text>
          <Text variant="bodySmall" style={styles.muted}>
            Biometric support: {biometricSupported ? "Available" : "Unavailable"}
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            Biometric quick login: {biometricLoginAvailable ? "Configured" : "Not configured"}
          </Text>
          <Button
            mode="outlined"
            icon="fingerprint"
            onPress={clearBiometricCredentials}
            disabled={!biometricLoginAvailable}
          >
            Clear Biometric Credentials
          </Button>
          <Button mode="contained-tonal" icon="logout" onPress={signOut}>
            Sign Out
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={integrationDialogVisible}
          onDismiss={() => setIntegrationDialogVisible(false)}
        >
          <Dialog.Title>Connect Integration</Dialog.Title>
          <Dialog.Content style={styles.section}>
            <View style={styles.providerRow}>
              {(["GOOGLE_DRIVE", "DROPBOX"] as Provider[]).map((provider) => (
                <Chip
                  key={provider}
                  selected={selectedProvider === provider}
                  onPress={() => setSelectedProvider(provider)}
                >
                  {providerLabels[provider]}
                </Chip>
              ))}
            </View>
            <TextInput
              mode="outlined"
              label="Access token"
              value={accessToken}
              onChangeText={setAccessToken}
            />
            <TextInput
              mode="outlined"
              label="Refresh token (optional)"
              value={refreshToken}
              onChangeText={setRefreshToken}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIntegrationDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={onSaveIntegration}
              loading={savingIntegration}
              disabled={savingIntegration || !accessToken.trim()}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={Boolean(snackbar)} onDismiss={() => setSnackbar("")}>
        {snackbar}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    marginBottom: 12,
  },
  section: {
    gap: 10,
  },
  muted: {
    opacity: 0.7,
  },
  integrationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  integrationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  integrationActions: {
    alignItems: "flex-end",
  },
  providerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});

