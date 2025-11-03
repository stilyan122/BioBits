import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { getToken, setToken, delToken } from "../lib/storage";
import { routes } from "../lib/routes";

type User = { id: string; email: string; displayName?: string; roles: string[] };

type AuthCtx = {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const access = getToken("access") as string | null;
      if (access) {
        try {
          const { data } = await api.get(routes.me); 
          setUser(data as User);
        } catch {
          delToken("access");
          delToken("refresh");
        }
      }
      setReady(true);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("SIGNIN CALLED with:", email);
    const { data } = await api.post(routes.login, { email, password });

    const access =
      data?.accessToken ??
      data?.token ??
      data?.jwtToken ??
      data?.jwt ??
      null;

    const refresh =
      data?.refreshToken ??
      data?.refresh_token ??
      null;

    if (!access) {
      console.log("LOGIN RESPONSE (unexpected):", data);
      throw new Error("API did not return an access token");
    }

    setToken("access", access);
    if (refresh) setToken("refresh", refresh);

    const me = await api.get(routes.me);
    setUser(me.data as User);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const body = {
      email,
      password,
      role: "Student",
      displayName: displayName || undefined
    };
    await api.post(routes.register, body);
    await signIn(email, password);
  };

  const signOut = () => {
    const refresh = getToken("refresh") as string | null;
    if (refresh) api.post(routes.logout, { refreshToken: refresh }).catch(() => {});
    delToken("access");
    delToken("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
