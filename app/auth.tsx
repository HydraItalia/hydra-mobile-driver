import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { exchangeToken } from "@/src/api/auth";
import { useAuth } from "@/src/auth/context";

export default function AuthScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing token");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await exchangeToken(token);
        if (cancelled) return;
        await signIn(data);
        router.replace("/(tabs)");
      } catch {
        if (!cancelled) {
          setError("This link is invalid or has expired. Please request a new one.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, signIn, router]);

  return (
    <ThemedView style={styles.container}>
      {error ? (
        <ThemedText style={styles.error}>{error}</ThemedText>
      ) : (
        <>
          <ActivityIndicator size="large" color="#E81B1B" />
          <ThemedText style={styles.text}>Signing in...</ThemedText>
        </>
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
  text: {
    marginTop: 16,
    opacity: 0.6,
  },
  error: {
    color: "#dc2626",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
