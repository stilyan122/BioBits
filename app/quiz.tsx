// Navigation helpers (push/replace/back)
import { useRouter } from "expo-router";

// History logging for quiz attempts
import { addQuizHistory } from "../lib/history";

// React hooks for state, memo, timers
import { useEffect, useMemo, useRef, useState } from "react";

// RN UI primitives
import { Button, Pressable, ScrollView, Text, View } from "react-native";

// Our question generator + type
import { makeCodonToAA, Question } from "../lib/quiz";

// Generate questions once when the component mounts (memoized so it doesn't regenerate)
export default function QuizScreen() {
  // Seed to force new question sets on Restart (no navigation needed)
  const [seed, setSeed] = useState(0);

  // 10 questions - O(n) generator; re-run when seed changes
  const qs = useMemo(() => makeCodonToAA(10), [seed]);

  // Router for navigation (Back button)
  const router = useRouter();
  
  // Current question index (0 - qs.length-1)
  const [i, setI] = useState(0);                  

  // Number of correct answers so far
  const [score, setScore] = useState(0);           

  // Time per question in ms (for averaging)
  const [times, setTimes] = useState<number[]>([]); 

  // Currently picked choice; null when waiting
  const [picked, setPicked] = useState<string | null>(null); 

  // Ref holding the start time (ms) of the current question.
  const t0 = useRef<number>(Date.now());         

  // Whenever the question index changes, reset the start time.
  useEffect(() => { t0.current = Date.now(); }, [i]);

  // ---- Derived values used in both question and results views ----
  const total = qs.length;
  const avgMs = times.length
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : 0;

  // ---- ONE-TIME save of quiz attempt after completion (top-level hooks!) ----
  const savedRef = useRef(false);
  useEffect(() => {
    if (i >= total && !savedRef.current) {
      savedRef.current = true;
      addQuizHistory(score, total, avgMs);
    }
  }, [i, score, total, avgMs]);

  // If we've answered all questions, render the results view.
  if (i >= total) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Results</Text>
        <Text>Score: {score} / {total}</Text>
        <Text>Avg time/question: {(avgMs / 1000).toFixed(2)} s</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          {/* Restart: regenerate questions + reset local state */}
          <Button title="Restart" onPress={() => {
            setSeed(s => s + 1);   // new question set
            setI(0);               // reset index
            setScore(0);           // reset score
            setTimes([]);          // reset times
            setPicked(null);       // clear selection
            savedRef.current = false; // allow saving next attempt
          }}/>
          {/* Back out to previous screen (Tab One) */}
          <Button title="Back to Home" onPress={() => router.back()} />
          {/* Optional: jump to History (if you have /history route) */}
          {/* <Button title="View History" onPress={() => router.push('/history' as any)} /> */}
        </View>
      </ScrollView>
    );
  }

  // Only compute current question when i is in range
  const q: Question = qs[i] as Question;

  // Handle an answer tap.
  const onPick = (choice: string) => {
    // Ignore double taps while feedback is shown
    if (picked) return;

    // Lock in the selected choice (triggers feedback colors)
    setPicked(choice);

    // Elapsed time for this question in ms
    const dt = Date.now() - t0.current;

    // Append to times array (immutable update)
    setTimes(prev => [...prev, dt]);

    // If correct, increment score
    if (choice === q.correct) setScore(s => s + 1);

    // After a short delay to show feedback, advance to the next question or results.
    setTimeout(() => {
      if (i + 1 < total) {
        setI(i + 1);      // next question
        setPicked(null);  // clear selection
      } else {
        setPicked(choice); // keep for visual stability
        setI(total);       // trigger results view
      }
    }, 400);
  };

  // Active question view.
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 16, color: "#666" }}>
        Question {i + 1} / {total}
      </Text>

      <Text style={{ fontSize: 20, fontWeight: "700" }}>{q.prompt}</Text>

      <View style={{ gap: 8 }}>
        {q.choices.map((c) => {
          const isPicked = picked === c;
          const isCorrect = c === q.correct;
          const bg = picked
            ? (isCorrect ? "#d1fadc" : isPicked ? "#ffd6d6" : "#f1f1f1")
            : "#f1f1f1";

          return (
            <Pressable
              key={c}
              onPress={() => onPick(c)}
              style={{
                padding: 14,
                borderRadius: 10,
                backgroundColor: bg,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Text style={{ fontSize: 18 }}>{c}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text>Score: {score}</Text>
        <Text>Time: {((Date.now() - t0.current) / 1000).toFixed(1)} s</Text>
      </View>
    </ScrollView>
  );
}