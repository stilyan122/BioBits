import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { API_URL } from "../lib/config";

const STORAGE_KEY = "auth:user";

export type Role = "Admin" | "Teacher" | "Student" | "Viewer";

export type AuthState = {
  token: string;
  email: string;
  roles: Role[];
};

type AuthContextType = {
  user: AuthState | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: Role | Role[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setUser(JSON.parse(raw) as AuthState);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error(`Login failed (${res.status})`);
    }

    const data = await res.json();
    const next: AuthState = {
      token: data.token,
      email: data.user,
      roles: data.roles as Role[],
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const hasRole = (roles: Role | Role[]) => {
    if (!user) return false;
    const wanted = Array.isArray(roles) ? roles : [roles];
    return user.roles.some((r) => wanted.includes(r));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}