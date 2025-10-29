import * as Clipboard from "expo-clipboard"; // npx expo install expo-clipboard
import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useToast } from "../components/Toast";
import * as dna from "../lib/dna";
import { addHistory } from "../lib/history";

// Tiny pill-styled button
function Btn({
  title,
  onPress,
  kind = "primary",
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  kind?: "primary" | "ghost";
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        kind === "ghost" && styles.btnGhost,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.btnPressed,
      ]}
    >
      <Text style={[styles.btnText, kind === "ghost" && styles.btnGhostText]}>
        {title}
      </Text>
    </Pressable>
  );
}

function Pill({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        active ? styles.pillActive : styles.pillIdle,
      ]}
    >
      <Text style={active ? styles.pillActiveText : styles.pillIdleText}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ToolsScreen() {
  // Raw input
  const [seq, setSeq] = useState("");

  // Translation config
  const [frame, setFrame] = useState<0 | 1 | 2>(0);
  const [trimStop, setTrimStop] = useState<boolean>(false);

  // Derived values (fast O(n))
  const cleaned = useMemo(() => dna.clean(seq), [seq]);
  const rna = useMemo(() => dna.transcribe(seq), [seq]); // live preview
  const aa  = useMemo(
    () => dna.translateFrame(rna, frame, trimStop ? "trim" : "keep"),
    [rna, frame, trimStop]
  ); // live preview with frame/stop
  const gc  = useMemo(() => dna.gcContent(seq), [seq]);  // % with 2 d.p.

  // Enable/disable logic
  const hasAnyInput   = seq.length > 0;
  const hasValidBases = cleaned.length > 0;
  const canTranslate  = Math.max(0, rna.length - frame) >= 3; // at least one codon in that frame

  // Data-quality hint: any non-ACGT present?
  const hasNoise = useMemo(
    () => cleaned.length !== seq.replace(/\s+/g, "").length,
    [seq, cleaned]
  );

  // Global toast
  const toast = useToast();

  const copy = async (text: string, label = "Copied!") => {
    try {
      await Clipboard.setStringAsync(text);
      toast.show(label);
    } catch {
      Alert.alert("Copy failed", "Could not copy to clipboard.");
    }
  };

  // Apply-actions that mutate the editor + log to history
  const run = async (type: "clean" | "revcomp") => {
    let output = "";
    if (type === "clean")   output = cleaned;
    if (type === "revcomp") output = dna.reverseComplement(seq);

    setSeq(output);
    await addHistory({ type, input: seq, output });
    toast.show(type === "clean" ? "Cleaned" : "Reverse-complemented");
  };

  // Save-only actions: log results without changing the editor
  const saveTranscription = async () => {
    if (!hasValidBases) return;
    await addHistory({ type: "transcribe", input: seq, output: rna });
    toast.show("Transcription saved");
  };

  const saveTranslation = async () => {
    if (!canTranslate) return;
    // Store frame + trim meta in output label for quick recall
    const note = ` (frame=${frame}${trimStop ? ", trim" : ""})`;
    await addHistory({
      type: "translate",
      input: rna,
      output: aa + note,
      meta: { frame, trimStop },
    } as any);
    toast.show("Translation saved");
  };

  return (
    <ScrollView style={{ backgroundColor: "#f6f8fb" }} contentContainerStyle={styles.page}>
      {/* Title block */}
      <View style={styles.headerCard}>
        <Text style={styles.h1}>DNA Tools</Text>
        <Text style={styles.sub}>
          Paste a DNA sequence and run Clean or Reverse-complement. RNA and AA update live. You can Copy or save Transcription/Translation to History.
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Length</Text>
            <Text style={styles.statValue}>{cleaned.length}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>GC%</Text>
            <Text style={styles.statValue}>{gc.toFixed(2)}</Text>
          </View>
        </View>

        {/* Data quality banner (optional) */}
        {hasNoise && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Heads-up: input contains characters outside A/C/G/T. “Clean” will remove them.
            </Text>
          </View>
        )}
      </View>

      {/* Input editor */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>DNA input</Text>
        <TextInput
          multiline
          value={seq}
          onChangeText={setSeq}
          placeholder="Paste DNA (A C G T)…"
          autoCapitalize="characters"
          autoCorrect={false}
          spellCheck={false}
          style={styles.input}
        />

        {/* Apply + Save actions */}
        <View style={styles.actionsRow}>
          <Btn title="Clean" onPress={() => run("clean")} disabled={!hasAnyInput} />
          <Btn title="Reverse-complement" onPress={() => run("revcomp")} disabled={!hasValidBases} />
          <Btn title="Transcribe (save)" onPress={saveTranscription} disabled={!hasValidBases} />
          <Btn title="Translate (save)" onPress={saveTranslation} disabled={!canTranslate} />
        </View>
      </View>

      {/* RNA panel (preview + copy) */}
      <View style={styles.card}>
        <View style={styles.cardHeadRow}>
          <Text style={styles.cardTitle}>RNA (T → U)</Text>
          <Btn title="Copy" kind="ghost" onPress={() => copy(rna, "RNA copied")} disabled={!rna} />
        </View>
        <Text selectable style={styles.mono}>{rna}</Text>
      </View>

      {/* Translation config */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Translation settings</Text>
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <Text style={{ fontWeight: "700", color: "#0f172a" }}>Frame:</Text>
          <Pill active={frame === 0} label="0" onPress={() => setFrame(0)} />
          <Pill active={frame === 1} label="1" onPress={() => setFrame(1)} />
          <Pill active={frame === 2} label="2" onPress={() => setFrame(2)} />

          <View style={{ width: 8 }} />
          <Pill
            active={trimStop}
            label="Trim at stop (*)"
            onPress={() => setTrimStop((v) => !v)}
          />
        </View>
      </View>

      {/* Translation panel (preview + copy) */}
      <View style={styles.card}>
        <View style={styles.cardHeadRow}>
          <Text style={styles.cardTitle}>AA (translation)</Text>
          <Btn title="Copy" kind="ghost" onPress={() => copy(aa, "AA copied")} disabled={!aa} />
        </View>
        <Text selectable style={styles.mono}>{aa}</Text>
        <Text style={styles.hint}>
          Translation uses the selected frame and {trimStop ? "trims" : "keeps"} stop codons.
        </Text>
      </View>

      {/* Footer note */}
      <View style={styles.footer}>
        <Text style={styles.footnote}>All processing is local; history is stored on device.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 32 },

  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e7edf6",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  h1: { fontSize: 22, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  sub: { color: "#475569" },

  statsRow: { flexDirection: "row", marginTop: 12 },
  stat: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e9f2",
    borderRadius: 10,
    marginRight: 8,
  },
  statLabel: { fontSize: 12, color: "#64748b" },
  statValue: { fontSize: 16, fontWeight: "800", color: "#0f172a" },

  banner: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#ffedd5",
  },
  bannerText: { color: "#7c2d12" },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e7edf6",
    padding: 14,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 8 },

  input: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#e5e9f2",
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    backgroundColor: "#fbfdff",
  },

  actionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },

  btn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#0b63ce",
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  btnGhost: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e9f2",
  },
  btnDisabled: { opacity: 0.5 },
  btnPressed: { opacity: 0.92 },
  btnText: { color: "#fff", fontWeight: "700" },
  btnGhostText: { color: "#0f172a" },

  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  pillIdle: { backgroundColor: "#f8fafc", borderColor: "#e5e9f2" },
  pillActive: { backgroundColor: "#0b63ce", borderColor: "#0b63ce" },
  pillIdleText: { color: "#0f172a", fontWeight: "700" },
  pillActiveText: { color: "#fff", fontWeight: "700" },

  mono: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    color: "#111827",
  },
  hint: { marginTop: 8, color: "#64748b", fontSize: 12 },

  footer: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#f2f6ff",
    borderWidth: 1,
    borderColor: "#e6ecff",
  },
  footnote: { color: "#637899" },
});
