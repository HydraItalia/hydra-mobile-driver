import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DeliveryDetail, fetchDeliveryDetail } from "@/src/api/deliveries";

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: "#6b7280",
  PICKED_UP: "#f59e0b",
  IN_TRANSIT: "#3b82f6",
  DELIVERED: "#22c55e",
  EXCEPTION: "#ef4444",
};

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchDeliveryDetail(id)
      .then(setDelivery)
      .catch(() => setError("Failed to load delivery"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error || !delivery) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>{error ?? "Delivery not found"}</ThemedText>
      </ThemedView>
    );
  }

  const address = delivery.fullAddress || delivery.addressLine1;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  STATUS_COLORS[delivery.status] ?? "#6b7280",
              },
            ]}
          >
            <ThemedText style={styles.badgeText}>
              {delivery.status.replace("_", " ")}
            </ThemedText>
          </View>
          <ThemedText style={styles.orderNumber}>
            {delivery.orderNumber}
          </ThemedText>
        </View>

        <ThemedText type="title" style={styles.clientName}>
          {delivery.clientName}
        </ThemedText>

        {address ? (
          <Pressable
            onPress={() =>
              Linking.openURL(
                `maps:?q=${encodeURIComponent(address)}`,
              )
            }
          >
            <ThemedText style={styles.address}>{address}</ThemedText>
          </Pressable>
        ) : null}

        {delivery.phone ? (
          <Pressable
            onPress={() => Linking.openURL(`tel:${delivery.phone}`)}
          >
            <ThemedText style={styles.phone}>{delivery.phone}</ThemedText>
          </Pressable>
        ) : null}

        {delivery.notes ? (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold">Notes</ThemedText>
            <ThemedText style={styles.notes}>{delivery.notes}</ThemedText>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">
            Items ({delivery.items.length})
          </ThemedText>
          {delivery.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <ThemedText style={styles.itemName}>{item.name}</ThemedText>
              <ThemedText style={styles.itemQty}>x{item.qty}</ThemedText>
            </View>
          ))}
        </View>

        {delivery.totalCents != null && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold">Total</ThemedText>
            <ThemedText>
              {(delivery.totalCents / 100).toFixed(2)} EUR
            </ThemedText>
          </View>
        )}

        {delivery.vendorName && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold">Vendor</ThemedText>
            <ThemedText>{delivery.vendorName}</ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  orderNumber: {
    opacity: 0.5,
    fontSize: 14,
  },
  clientName: {
    marginBottom: 8,
  },
  address: {
    color: "#E81B1B",
    fontSize: 15,
    marginBottom: 4,
  },
  phone: {
    color: "#E81B1B",
    fontSize: 15,
    marginBottom: 12,
  },
  section: {
    marginTop: 20,
  },
  notes: {
    marginTop: 4,
    opacity: 0.7,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128,128,128,0.2)",
  },
  itemName: {
    flex: 1,
  },
  itemQty: {
    opacity: 0.6,
    marginLeft: 12,
  },
});
