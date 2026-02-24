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
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
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

  // On mount: check for existing tokens
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          setIsAuthenticated(true);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (data: ExchangeResponse) => {
    await setAccessToken(data.accessToken);
    await setRefreshToken(data.refreshToken);
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
