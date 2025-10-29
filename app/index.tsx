import { Link } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BioBits</Text>
      <Text style={styles.subtitle}>Pocket genetics toolkit + quizzes</Text>

      <Link href="/quiz" asChild>
        <Button title="Start Quiz (Codon → AA)" />
      </Link>

      <Link href="/tools" asChild>
        <Button title="Open DNA Tools" />
      </Link>

      <View style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#666', marginBottom: 8 },
  separator: { marginTop: 24, height: 1, width: '80%', backgroundColor: '#eee' },
});