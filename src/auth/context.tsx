import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DriverProfile, ExchangeResponse } from "@/src/api/auth";
import { logoutRemote } from "@/src/api/auth";
import { setOnAuthFailure } from "@/src/api/client";
import {
  clearTokens,
  getAccessToken,
  getDriver,
  getRefreshToken,
  setAccessToken,
  setDriver as persistDriver,
  setRefreshToken,
} from "@/src/auth/storage";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  driver: DriverProfile | null;
  signIn: (data: ExchangeResponse) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [driver, setDriver] = useState<DriverProfile | null>(null);

  // On mount: check for existing tokens and restore driver profile
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const storedDriver = await getDriver();
          setDriver(storedDriver);
          setIsAuthenticated(true);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Register auth failure callback so token-refresh failures reset in-memory state
  useEffect(() => {
    setOnAuthFailure(() => {
      clearTokens();
      setDriver(null);
      setIsAuthenticated(false);
    });
    return () => setOnAuthFailure(null);
  }, []);

  const signIn = useCallback(async (data: ExchangeResponse) => {
    await setAccessToken(data.accessToken);
    await setRefreshToken(data.refreshToken);
    await persistDriver(data.driver);
    setDriver(data.driver);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    try {
      const refresh = await getRefreshToken();
      if (refresh) {
        await logoutRemote(refresh).catch(() => {});
      }
    } finally {
      await clearTokens();
      setDriver(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, driver, signIn, signOut }),
    [isAuthenticated, isLoading, driver, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
