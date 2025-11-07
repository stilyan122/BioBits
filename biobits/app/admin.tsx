import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { adminApi, AdminUser, DnaLogRow, QuizLogRow } from "../lib/adminApi";
import { Platform } from "react-native";

const stopWebClick = Platform.OS === "web"
  ? ({ onClick: (e: any) => e.stopPropagation() } as any)
  : {};

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[S.pill, active ? S.pillActive : S.pillIdle]}>
      <Text style={active ? S.pillActiveText : S.pillIdleText}>{label}</Text>
    </Pressable>
  );
}

export default function AdminScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // If roles are not present yet, treat as not-admin to avoid a flicker
  const roles = user?.roles ?? [];
  const isAdmin = roles.includes("Admin");

  useEffect(() => {
    if (!isAdmin) router.replace("/");
  }, [isAdmin]);

  const [tab, setTab] = useState<"users" | "activity" | "stats">("users");

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={S.h1}>Admin</Text>
      <View style={S.tabs}>
        <Tab label="Users" active={tab === "users"} onPress={() => setTab("users")} />
        <Tab label="Activity" active={tab === "activity"} onPress={() => setTab("activity")} />
        <Tab label="Stats" active={tab === "stats"} onPress={() => setTab("stats")} />
      </View>

      {tab === "users" && <UsersTab selfId={user?.id ?? ""} />}
      {tab === "activity" && <ActivityTab />}
      {tab === "stats" && <StatsTab />}
    </ScrollView>
  );
}

/* ============ Users ============ */
function UsersTab({ selfId }: { selfId: string }) {
  const [list, setList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState<"Student" | "Admin">("Student");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.listUsers();
      setList(data);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? e?.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ok = true;
    (async () => {
      await load();
    })();
    return () => { ok = false; };
  }, []);

  const onCreate = async () => {
    if (!email || !pass) {
      Alert.alert("Missing", "Email and password are required");
      return;
    }
    try {
      setBusyId("create");
      await adminApi.createUser(email.trim(), pass, role);
      setEmail(""); setPass("");
      await load();
    } catch (e: any) {
      const msg = Array.isArray(e?.response?.data)
        ? e.response.data.map((x: any) => x?.description).join(", ")
        : e?.response?.data?.message ?? e?.message;
      Alert.alert("Create failed", String(msg ?? "Unknown error"));
    } finally {
      setBusyId(null);
    }
  };

  const setUserRole = async (u: AdminUser, next: "Admin" | "Student") => {
    try {
      setBusyId(u.id);
      await adminApi.setRole(u.id, next);
      await load();
    } catch (e: any) {
      Alert.alert("Role update failed", e?.response?.data?.message ?? e?.message ?? "Error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (u: AdminUser) => {
    if (u.id === selfId) {
      Alert.alert("Blocked", "You cannot delete your own account.");
      return;
    }
    Alert.alert("Delete user", `Delete ${u.email ?? u.userName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setBusyId(u.id);
            await adminApi.deleteUser(u.id);
            setList(xs => xs.filter(x => x.id !== u.id)); // optimistic
          } catch (e: any) {
            Alert.alert("Delete failed", e?.response?.data?.message ?? e?.message ?? "Error");
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={S.card}>
      <Text style={S.cardTitle}>Users</Text>

      {/* Create */}
      <View style={{ gap: 8 }}>
        <Text style={S.smallTitle}>Create user</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email"
            autoCapitalize="none"
            style={S.input}
          />
          <TextInput
            value={pass}
            onChangeText={setPass}
            placeholder="temp password"
            secureTextEntry
            style={S.input}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => setRole("Student")}
              style={[S.pill, role === "Student" ? S.pillActive : S.pillIdle]}
            >
              <Text style={role === "Student" ? S.pillActiveText : S.pillIdleText}>Student</Text>
            </Pressable>
            <Pressable
              onPress={() => setRole("Admin")}
              style={[S.pill, role === "Admin" ? S.pillActive : S.pillIdle]}
            >
              <Text style={role === "Admin" ? S.pillActiveText : S.pillIdleText}>Admin</Text>
            </Pressable>
          </View>
          <Pressable onPress={onCreate} style={[S.primaryBtn, busyId === "create" && { opacity: 0.6 }]}>
            <Text style={S.primaryBtnText}>{busyId === "create" ? "Creating…" : "Create"}</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ height: 12 }} />

      {/* List */}
      <View style={{ gap: 8 }}>
        <Text style={S.smallTitle}>All users {loading ? "(loading…)" : `(${list.length})`}</Text>
        {list.map((u) => {
          const rAdmin = u.roles?.includes("Admin");
          const isBusy = busyId === u.id;
          return (
            <View key={u.id} style={S.row}>
              <View style={{ flex: 1 }}>
                <Text style={S.bold}>{u.email ?? u.userName}</Text>
                <Text style={S.dim}>Roles: {u.roles?.join(", ") || "—"}</Text>
              </View>



              <Pressable
                {...stopWebClick}
                onPress={() => setUserRole(u, rAdmin ? "Student" : "Admin")}
                style={S.ghostBtn}
              >
                <Text style={S.ghostBtnText}>{rAdmin ? "Demote" : "Promote"}</Text>
              </Pressable>
            </View>
          );
        })}
        {!loading && list.length === 0 && <Text style={S.dim}>No users.</Text>}
      </View>
    </View>
  );
}

/* ============ Activity ============ */
function ActivityTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [kind, setKind] = useState<"dna" | "quiz">("dna");
  const [dna, setDna] = useState<DnaLogRow[]>([]);
  const [quiz, setQuiz] = useState<QuizLogRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      const { data } = await adminApi.listUsers();
      setUsers(data);
    } catch {}
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      if (kind === "dna") {
        const { data } = await adminApi.listDna(userId);
        setDna(data);
      } else {
        const { data } = await adminApi.listQuiz(userId);
        setQuiz(data);
      }
    } catch (e: any) {
      Alert.alert("Load failed", e?.response?.data?.message ?? e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { loadLogs(); }, [kind, userId]);

  const emailById = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => map.set(u.id, u.email ?? u.userName ?? u.id));
    return map;
  }, [users]);

  const delDna = async (id: number) => {
    try {
      await adminApi.delDna(id);
      setDna((xs) => xs.filter((x) => x.id !== id));
    } catch (e: any) {
      Alert.alert("Delete failed", e?.response?.data?.message ?? e?.message ?? "Error");
    }
  };
  const delQuiz = async (id: number) => {
    try {
      await adminApi.delQuiz(id);
      setQuiz((xs) => xs.filter((x) => x.id !== id));
    } catch (e: any) {
      Alert.alert("Delete failed", e?.response?.data?.message ?? e?.message ?? "Error");
    }
  };

  return (
    <View style={S.card}>
      <Text style={S.cardTitle}>Activity</Text>

      {/* Filters */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Pressable onPress={() => setKind("dna")} style={[S.pill, kind === "dna" ? S.pillActive : S.pillIdle]}>
          <Text style={kind === "dna" ? S.pillActiveText : S.pillIdleText}>DNA</Text>
        </Pressable>
        <Pressable onPress={() => setKind("quiz")} style={[S.pill, kind === "quiz" ? S.pillActive : S.pillIdle]}>
          <Text style={kind === "quiz" ? S.pillActiveText : S.pillIdleText}>Quiz</Text>
        </Pressable>

        {/* Quick user filter */}
        <View style={{ width: "100%", marginTop: 6 }} />
        <Text style={S.dim}>Filter by user:</Text>
        <Pressable onPress={() => setUserId(undefined)} style={[S.pill, !userId ? S.pillActive : S.pillIdle]}>
          <Text style={!userId ? S.pillActiveText : S.pillIdleText}>All</Text>
        </Pressable>
        {users.slice(0, 8).map((u) => (
          <Pressable
            key={u.id}
            onPress={() => setUserId(u.id)}
            style={[S.pill, userId === u.id ? S.pillActive : S.pillIdle]}
          >
            <Text style={userId === u.id ? S.pillActiveText : S.pillIdleText}>
              {u.email ?? u.userName}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 10 }} />
      <Text style={S.smallTitle}>{loading ? "Loading…" : "Entries"}</Text>

      {/* Lists */}
      {kind === "dna" ? (
        <View style={{ gap: 8 }}>
          {dna.map((r) => (
            <View key={`dna-${r.id}`} style={S.rowCard}>
              <View style={{ flex: 1 }}>
                <Text style={S.bold}>{r.type.toUpperCase()}</Text>
                <Text style={S.dim}>
                  {new Date(r.createdAt).toLocaleString()} · {emailById.get(r.userId)}
                </Text>
                {!!r.input && <Text numberOfLines={1}>in: {r.input}</Text>}
                {!!r.output && <Text numberOfLines={1}>out: {r.output}</Text>}
              </View>
              <Pressable onPress={() => delDna(r.id)} style={S.ghostBtn}>
                <Text style={[S.ghostBtnText, { color: "#b91c1c" }]}>Delete</Text>
              </Pressable>
            </View>
          ))}
          {dna.length === 0 && !loading && <Text style={S.dim}>No DNA entries.</Text>}
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {quiz.map((r) => (
            <View key={`quiz-${r.id}`} style={S.rowCard}>
              <View style={{ flex: 1 }}>
                <Text style={S.bold}>
                  {r.score}/{r.total} · {(r.avgMs / 1000).toFixed(2)}s avg
                </Text>
                <Text style={S.dim}>
                  {new Date(r.createdAt).toLocaleString()} · {emailById.get(r.userId)}
                </Text>
                {!!r.kind && <Text style={S.dim}>{r.kind}</Text>}
              </View>
              <Pressable onPress={() => delQuiz(r.id)} style={S.ghostBtn}>
                <Text style={[S.ghostBtnText, { color: "#b91c1c" }]}>Delete</Text>
              </Pressable>
            </View>
          ))}
          {quiz.length === 0 && !loading && <Text style={S.dim}>No Quiz entries.</Text>}
        </View>
      )}
    </View>
  );
}

/* ============ Stats ============ */
function StatsTab() {
  const [stats, setStats] = useState<{ label: string; value: string | number }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminApi.stats();
        setStats([
          { label: "Users", value: data.users },
          { label: "DNA logs", value: data.dnaCount },
          { label: "Quiz logs", value: data.quizCount },
          { label: "Active (7d)", value: data.active7 },
          { label: "Avg quiz time (ms)", value: Math.round(data.avgQuizTime) },
        ]);
      } catch (e: any) {
        Alert.alert("Stats error", e?.response?.data?.message ?? e?.message ?? "Error");
      }
    })();
  }, []);

  return (
    <View style={S.card}>
      <Text style={S.cardTitle}>Stats</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {stats.map((s) => (
          <View key={s.label} style={S.stat}>
            <Text style={S.statLabel}>{s.label}</Text>
            <Text style={S.statValue}>{s.value}</Text>
          </View>
        ))}
        {stats.length === 0 && <Text style={S.dim}>No stats yet.</Text>}
      </View>
    </View>
  );
}

/* ============ Styles ============ */
const S = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 6 },

  tabs: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  pillIdle: { backgroundColor: "#f8fafc", borderColor: "#e5e9f2" },
  pillActive: { backgroundColor: "#0b63ce", borderColor: "#0b63ce" },
  pillIdleText: { color: "#0f172a", fontWeight: "700" },
  pillActiveText: { color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e7edf6",
    padding: 14,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },

  smallTitle: { fontSize: 13, fontWeight: "800", color: "#334155" },

  input: {
    minWidth: 180,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e9f2",
    backgroundColor: "#f8fafc",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#eef2f7",
    borderRadius: 12,
    backgroundColor: "#fbfdff",
  },

  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#0b63ce",
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  ghostBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e9f2",
    backgroundColor: "#f8fafc",
  },
  ghostBtnText: { color: "#0f172a", fontWeight: "800" },

  bold: { fontWeight: "800", color: "#0f172a" },
  dim: { color: "#64748b" },

  stat: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e9f2",
    borderRadius: 10,
    minWidth: 140,
  },
  statLabel: { fontSize: 12, color: "#64748b" },
  statValue: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
});