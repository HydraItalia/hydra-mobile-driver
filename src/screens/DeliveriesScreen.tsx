import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DeliverySummary, fetchDeliveries } from "@/src/api/deliveries";

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: "#6b7280",
  PICKED_UP: "#f59e0b",
  IN_TRANSIT: "#3b82f6",
  DELIVERED: "#22c55e",
  EXCEPTION: "#ef4444",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: STATUS_COLORS[status] ?? "#6b7280" },
      ]}
    >
      <ThemedText style={styles.badgeText}>
        {status.replace("_", " ")}
      </ThemedText>
    </View>
  );
}

function DeliveryCard({
  delivery,
  onPress,
}: {
  delivery: DeliverySummary;
  onPress: () => void;
}) {
  const time = new Date(delivery.scheduledFor).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <ThemedText type="defaultSemiBold">{delivery.clientName}</ThemedText>
        <StatusBadge status={delivery.status} />
      </View>
      <ThemedText style={styles.cardSubtext}>
        {delivery.orderNumber} — {delivery.itemCount} item
        {delivery.itemCount !== 1 ? "s" : ""}
      </ThemedText>
      <ThemedText style={styles.cardSubtext}>
        {delivery.addressLine1}
      </ThemedText>
      <ThemedText style={styles.cardTime}>{time}</ThemedText>
    </Pressable>
  );
}

export default function DeliveriesScreen() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<DeliverySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchDeliveries();
      setDeliveries(data);
    } catch {
      setError("Failed to load deliveries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        Deliveries
      </ThemedText>
      {error ? (
        <ThemedView style={styles.center}>
          <ThemedText>{error}</ThemedText>
          <Pressable style={styles.retryButton} onPress={load}>
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DeliveryCard
              delivery={item}
              onPress={() => router.push(`/delivery/${item.id}`)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={
            deliveries.length === 0 ? styles.center : styles.list
          }
          ListEmptyComponent={
            <ThemedText style={styles.empty}>
              No deliveries for today
            </ThemedText>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "rgba(128,128,128,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardSubtext: {
    opacity: 0.6,
    fontSize: 14,
    marginTop: 2,
  },
  cardTime: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  empty: {
    opacity: 0.5,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#E81B1B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
