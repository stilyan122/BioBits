import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Email and password are required");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password mismatch", "Passwords must match");
      return;
    }

    try {
      setBusy(true);
      await signUp(email.trim(), password, displayName.trim() || undefined);
      router.replace("/"); 
    } catch (err: any) {
      const msg =
        err?.response?.data ??
        err?.message ??
        "Could not register. Check the API.";
      Alert.alert("Registration failed", String(msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={s.page}>
      <Text style={s.title}>Create account</Text>

      <TextInput
        style={s.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Display name (optional)"
      />

      <TextInput
        style={s.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        autoComplete="off"
        keyboardType="email-address"
      />

      <TextInput
        style={s.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      <TextInput
        style={s.input}
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Confirm password"
        secureTextEntry
      />

      <Pressable
        style={[s.btn, busy && { opacity: 0.5 }]}
        onPress={onSubmit}
        disabled={busy}
      >
        <Text style={s.btnText}>{busy ? "Creating..." : "Register"}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 16,
    gap: 14,
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
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
});