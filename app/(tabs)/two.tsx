import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View, Button } from 'react-native';
import * as dna from '../../lib/dna';

export default function DnaTools() {
  // Local state for the raw input sequence shown in the TextInput
  const [seq, setSeq] = useState('');

  // Derived values - clean the sequence
  const cleaned = useMemo(() => dna.clean(seq), [seq]);

  // Transcribe the DNA -> RNA, depends on seq
  const rna = useMemo(() => dna.transcribe(seq), [seq]);

  // Translate RNA -> amino acids, depends on seq
  const aa = useMemo(() => dna.translate(rna), [rna]);

  // GC% of the original sequence, depends on seq
  const gc = useMemo(() => dna.gcContent(seq), [seq]);

  return (
    // ScrollView to allow scrolling if content overflows
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontSize:18, fontWeight:'700' }}>DNA Tools</Text>

      <TextInput
        multiline
        value={seq}
        onChangeText={setSeq}
        placeholder="Paste DNA (ACGT)…"
        style={{
          borderWidth:1, borderColor:'#ccc', borderRadius:8,
          padding:12, minHeight:140, fontFamily:'monospace'
        }}
      />

      <Text>Length: {cleaned.length} • GC%: {gc}</Text>

      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
        <Button title="Clean" onPress={() => setSeq(cleaned)} />
        <Button title="Reverse complement" onPress={() => setSeq(dna.reverseComplement(seq))} />
        <Button title="Transcribe (DNA→RNA)" onPress={() => setSeq(rna)} />
      </View>

      <Text style={{ fontWeight:'600' }}>RNA</Text>
      <Text selectable style={{ fontFamily:'monospace' }}>{rna}</Text>

      <Text style={{ fontWeight:'600' }}>AA (Translation)</Text>
      <Text selectable style={{ fontFamily:'monospace' }}>{aa}</Text>
    </ScrollView>
  );
}