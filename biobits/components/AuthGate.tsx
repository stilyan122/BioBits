import { useRouter, usePathname } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready) {
      const isProtected = ["/tools", "/quiz", "/history"].includes(pathname);
      if (!user && isProtected) router.replace("/login");
    }
  }, [ready, user, pathname]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#0b63ce" />
      </View>
    );
  }

  return <>{children}</>;
}
