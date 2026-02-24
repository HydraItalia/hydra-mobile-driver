import * as SecureStore from "expo-secure-store";
import type { DriverProfile } from "@/src/api/auth";

const ACCESS_TOKEN_KEY = "hydra_access_token";
const REFRESH_TOKEN_KEY = "hydra_refresh_token";
const DRIVER_PROFILE_KEY = "hydra_driver_profile";

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getDriver(): Promise<DriverProfile | null> {
  const raw = await SecureStore.getItemAsync(DRIVER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DriverProfile;
  } catch {
    return null;
  }
}

export async function setDriver(driver: DriverProfile): Promise<void> {
  await SecureStore.setItemAsync(DRIVER_PROFILE_KEY, JSON.stringify(driver));
}

export async function clearDriver(): Promise<void> {
  await SecureStore.deleteItemAsync(DRIVER_PROFILE_KEY);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(DRIVER_PROFILE_KEY),
  ]);
}
