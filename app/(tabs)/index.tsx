import { Link } from 'expo-router';
import { Button, StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BioBits</Text>
      <Text style={styles.subtitle}>Pocket genetics toolkit + quizzes</Text>

      {/* Launch Quiz (stack screen at app/quiz.tsx) */}
      <Link href="/quiz" asChild>
        <Button title="Start Quiz (Codon → AA)" />
      </Link>

      {/* Open DNA Tools tab directly */}
      <Link href="/(tabs)/two" asChild>
        <Button title="Open DNA Tools" />
      </Link>

      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16,
  },
  title: {
    fontSize: 24, fontWeight: 'bold',
  },
  subtitle: {
    color: '#666', marginBottom: 8,
  },
  separator: {
    marginTop: 24, height: 1, width: '80%',
  },
});