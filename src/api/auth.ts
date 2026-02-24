import apiClient from "@/src/api/client";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DriverProfile {
  id: string;
  name: string | null;
  email: string;
}

export interface ExchangeResponse extends AuthTokens {
  driver: DriverProfile;
}

export async function requestMagicLink(
  email: string,
): Promise<{ ok: boolean }> {
  const res = await apiClient.post<{ ok: boolean }>(
    "/api/mobile/auth/request-link",
    { email },
  );
  return res.data;
}

export async function exchangeToken(
  token: string,
): Promise<ExchangeResponse> {
  const res = await apiClient.post<ExchangeResponse>(
    "/api/mobile/auth/exchange",
    { token },
  );
  return res.data;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<AuthTokens> {
  const res = await apiClient.post<AuthTokens>(
    "/api/mobile/auth/refresh",
    { refreshToken },
  );
  return res.data;
}

export async function logoutRemote(refreshToken: string): Promise<void> {
  await apiClient.post("/api/mobile/auth/logout", { refreshToken });
}
