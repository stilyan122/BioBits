import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View, Button } from 'react-native';
import * as dna from '../../lib/dna';
import { addHistory } from '../../lib/history';
import { router } from 'expo-router';

export default function DnaTools() {
  // Local state for the raw input sequence shown in the TextInput
  const [seq, setSeq] = useState('');

  // Derived values - clean the sequence
  const cleaned = useMemo(() => dna.clean(seq), [seq]);

  // Transcribe the DNA -> RNA, depends on seq
  const rna = useMemo(() => dna.transcribe(seq), [seq]);

  // Translate RNA -> amino acids, depends on rna
  const aa = useMemo(() => dna.translate(rna), [rna]);

  // GC% of the original sequence, depends on seq
  const gc = useMemo(() => dna.gcContent(seq), [seq]);

  const tooLong = cleaned.length > 10000; // simple guard to avoid lag on huge inputs

  return (
    // ScrollView to allow scrolling if content overflows
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontSize:18, fontWeight:'700' }}>DNA Tools</Text>

      <TextInput
        multiline
        value={seq}
        onChangeText={setSeq}
        placeholder="Paste DNA (ACGT)…"
        autoCapitalize="characters"   
        autoCorrect={false}         
        style={{
          borderWidth:1, borderColor:'#ccc', borderRadius:8,
          padding:12, minHeight:140, fontFamily:'monospace'
        }}
      />

      {tooLong && (
        <Text style={{ color: 'tomato' }}>
          Input is very long ({cleaned.length} nt). Consider trimming for speed.
        </Text>
      )}

      <Text>Length: {cleaned.length} • GC%: {gc}</Text>

      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
        <Button title="Clean" onPress={async () => {
          const next = cleaned;
          await addHistory({ type: 'clean', input: seq, output: next });
          setSeq(next);
        }} />

        <Button title="Reverse complement" onPress={async () => {
          const next = dna.reverseComplement(seq);
          await addHistory({ type: 'revcomp', input: seq, output: next });
          setSeq(next);
        }} />

        <Button title="Transcribe (DNA→RNA)" onPress={async () => {
          const next = dna.transcribe(seq);
          await addHistory({ type: 'transcribe', input: seq, output: next });
          setSeq(next);
        }} />

        <Button title="Save Translation" onPress={async () => {
          // We save RNA-AA as an action, but do not change the TextInput.
          await addHistory({ type: 'translate', input: rna, output: aa });
        }} />

        <Button title="Open History" onPress={() => router.push('/history')} />
      </View>

      <Text style={{ fontWeight:'600' }}>RNA</Text>
      <Text selectable style={{ fontFamily:'monospace' }}>{rna}</Text>

      <Text style={{ fontWeight:'600' }}>AA (Translation)</Text>
      <Text selectable style={{ fontFamily:'monospace' }}>{aa}</Text>
    </ScrollView>
  );
}