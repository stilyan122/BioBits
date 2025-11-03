import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const DEV_AUTOFILL = false; 

export default function LoginScreen() {
  const { signIn } = useAuth();            
  const router = useRouter();

  const [email, setEmail] = useState(DEV_AUTOFILL ? "admin@biobits.local" : "");
  const [password, setPassword] = useState(DEV_AUTOFILL ? "Admin123!" : "");
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Email and password are required");
      return;
    }
    try {
      setBusy(true);
      await signIn(email.trim(), password);
      router.replace("/");                
    } catch (err: any) {
      const msg =
        err?.response?.data ??
        err?.message ??
        "Could not sign in. Check your API URL and credentials.";
      Alert.alert("Login failed", String(msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>
        Use your credentials.
      </Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="email"
      />

      <TextInput
        style={styles.input}
        value={password}
        autoComplete="off"
        onChangeText={setPassword}
        placeholder="password"
        secureTextEntry
      />

      <Pressable
        style={[styles.btn, busy && { opacity: 0.5 }]}
        onPress={onSubmit}
        disabled={busy}
      >
        <Text style={styles.btnText}>{busy ? "Signing in..." : "Continue"}</Text>
      </Pressable>

      <Text
        style={{ textAlign: "center", color: "#0b63ce", marginTop: 10 }}
        onPress={() => router.push("/register")}>
        Don't have an account? Register
      </Text>

    </View>
    
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 16,
    gap: 14,
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  subtitle: { color: "#64748b", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: "#0b63ce",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  hint: { fontSize: 12, color: "#94a3b8", marginTop: 8 },
});
