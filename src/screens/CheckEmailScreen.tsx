import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { requestMagicLink } from "@/src/api/auth";

export default function CheckEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  async function handleResend() {
    if (!email || resending) return;
    setResending(true);
    setResendError(null);
    try {
      await requestMagicLink(email);
      setResent(true);
    } catch {
      setResendError("Failed to resend link. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Check your email
        </ThemedText>

        <ThemedText style={styles.body}>
          We sent a magic link to{"\n"}
          <ThemedText type="defaultSemiBold">{email}</ThemedText>
        </ThemedText>

        <ThemedText style={styles.body}>
          Tap the link in the email to sign in. It expires in 10 minutes.
        </ThemedText>

        <View style={styles.actions}>
          <Pressable
            style={[styles.resendButton, resent && styles.resendDone]}
            onPress={handleResend}
            disabled={resending || resent}
          >
            <ThemedText style={styles.resendText}>
              {resent
                ? "Link resent!"
                : resending
                  ? "Resending..."
                  : "Resend link"}
            </ThemedText>
          </Pressable>

          {resendError && (
            <ThemedText style={styles.resendError}>{resendError}</ThemedText>
          )}

          <Pressable onPress={() => router.back()}>
            <ThemedText style={styles.backText}>
              Use a different email
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 12,
  },
  actions: {
    marginTop: 32,
    alignItems: "center",
    gap: 16,
  },
  resendButton: {
    backgroundColor: "#E81B1B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resendDone: {
    backgroundColor: "#22c55e",
  },
  resendText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  resendError: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  backText: {
    color: "#E81B1B",
    fontSize: 14,
  },
});
