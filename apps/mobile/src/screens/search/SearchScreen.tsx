import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Snackbar, Text, TextInput } from "react-native-paper";
import { aiApi } from "../../api/aiApi";
import { searchApi } from "../../api/searchApi";
import { EmptyState } from "../../components/EmptyState";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SectionHeader } from "../../components/SectionHeader";
import { SearchResult } from "../../types/api";
import { formatBytes, formatDate, getErrorMessage } from "../../utils/format";

export function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [askingAssistant, setAskingAssistant] = useState(false);
  const [snackbar, setSnackbar] = useState("");

  async function onSearch() {
    if (!query.trim()) {
      return;
    }

    setSearching(true);
    try {
      const data = await searchApi.searchDocuments(query);
      setResults(data);
    } catch (searchError) {
      setSnackbar(getErrorMessage(searchError));
    } finally {
      setSearching(false);
    }
  }

  async function onAskAssistant() {
    if (!assistantQuery.trim()) {
      return;
    }

    setAskingAssistant(true);
    try {
      const answer = await aiApi.askAssistant(assistantQuery);
      setAssistantAnswer(answer);
    } catch (assistantError) {
      setSnackbar(getErrorMessage(assistantError));
    } finally {
      setAskingAssistant(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <SectionHeader
        title="Search & AI Assistant"
        subtitle="Find documents instantly or ask natural-language questions"
      />

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.section}>
          <Text variant="titleMedium">Keyword Search</Text>
          <View style={styles.inlineRow}>
            <TextInput
              mode="outlined"
              style={styles.flex}
              label="Search documents"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={onSearch}
            />
            <Button mode="contained" onPress={onSearch} loading={searching}>
              Go
            </Button>
          </View>
        </Card.Content>
      </Card>

      {query && results.length === 0 ? (
        <EmptyState
          title="No matching documents"
          message="Try a different keyword, tag, or mime-type term."
        />
      ) : null}

      {results.map((item) => (
        <Card mode="elevated" style={styles.resultCard} key={item.id}>
          <Card.Content>
            <Text variant="titleSmall">{item.title}</Text>
            <Text variant="bodySmall" style={styles.meta}>
              Folder: {item.folder.name}
            </Text>
            <Text variant="bodySmall" style={styles.meta}>
              {formatBytes(item.size)}  |  {item.mimeType}
            </Text>
            <Text variant="bodySmall" style={styles.meta}>
              Added {formatDate(item.createdAt)}
            </Text>
          </Card.Content>
        </Card>
      ))}

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.section}>
          <Text variant="titleMedium">AI Assistant</Text>
          <TextInput
            mode="outlined"
            label="Ask something like: Show medical reports from 2024"
            value={assistantQuery}
            onChangeText={setAssistantQuery}
            multiline
          />
          <Button
            mode="contained-tonal"
            icon="robot-outline"
            onPress={onAskAssistant}
            loading={askingAssistant}
          >
            Ask Assistant
          </Button>
          {assistantAnswer ? (
            <Card mode="elevated" style={styles.resultCard}>
              <Card.Content>
                <Text variant="bodyMedium">{assistantAnswer}</Text>
              </Card.Content>
            </Card>
          ) : null}
        </Card.Content>
      </Card>

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
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  resultCard: {
    borderRadius: 14,
    marginBottom: 8,
  },
  meta: {
    opacity: 0.75,
    marginTop: 2,
  },
});
