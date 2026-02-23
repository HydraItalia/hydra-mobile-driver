import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import apiClient from "@/src/api/client";
import { API_BASE_URL } from "@/src/config";
import { AxiosError } from "axios";

export default function PingScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ping() {
    setLoading(true);
    setResult(null);
    try {
      const res = await apiClient.get("/api/mobile/ping");
      setResult(`OK: ${res.status}`);
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        setResult(`Reached server, status ${error.response.status}`);
      } else {
        setResult("Network error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Hydra Driver</ThemedText>
      <ThemedText style={styles.subtitle}>{API_BASE_URL}</ThemedText>

      <Pressable style={styles.button} onPress={ping} disabled={loading}>
        <ThemedText style={styles.buttonText}>
          {loading ? "Pinging..." : "Ping Server"}
        </ThemedText>
      </Pressable>

      {loading && <ActivityIndicator style={styles.spinner} />}

      {result && (
        <View style={styles.resultBox}>
          <ThemedText type="defaultSemiBold">{result}</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  subtitle: {
    opacity: 0.6,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#E81B1B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  spinner: {
    marginTop: 16,
  },
  resultBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
});
