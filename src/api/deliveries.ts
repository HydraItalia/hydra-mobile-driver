import apiClient from "@/src/api/client";

export interface DeliverySummary {
  id: string;
  orderNumber: string;
  clientName: string;
  addressLine1: string;
  scheduledFor: string;
  status: string;
  itemCount: number;
}

export interface DeliveryDetail extends DeliverySummary {
  fullAddress: string;
  phone: string;
  notes: string;
  items: { name: string; qty: number; vendorName: string }[];
  totalCents: number | null;
  vendorName: string | null;
  pickedUpAt: string | null;
  inTransitAt: string | null;
  deliveredAt: string | null;
  exceptionAt: string | null;
  exceptionReason: string | null;
}

export async function fetchDeliveries(
  date?: string,
  status?: string,
): Promise<DeliverySummary[]> {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (status) params.set("status", status);
  const query = params.toString();
  const url = `/api/mobile/driver/deliveries${query ? `?${query}` : ""}`;
  const res = await apiClient.get<DeliverySummary[]>(url);
  return res.data;
}

export async function fetchDeliveryDetail(id: string): Promise<DeliveryDetail> {
  const res = await apiClient.get<DeliveryDetail>(
    `/api/mobile/driver/deliveries/${id}`,
  );
  return res.data;
}
