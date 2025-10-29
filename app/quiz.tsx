// Navigation helpers (push/replace/back)
import { useRouter } from "expo-router";

// React hooks for state, memo, timers
import { useEffect, useMemo, useRef, useState } from "react";

// RN UI primitives
import { Button, Pressable, ScrollView, Text, View } from "react-native";

// Our question generator + type
import { makeCodonToAA, Question } from "../lib/quiz";

// Generate questions once when the component mounts (memoized so it doesn't regenerate)
export default function QuizScreen() {
  // 10 questions - O(n) generator
  const [seed, setSeed] = useState(0);
  const qs = useMemo(() => makeCodonToAA(10), [seed]);

  // Router for navigation
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

  // Current question object (prompt, choices, correct)
  const q: Question = qs[i];

  // Handle an answer tap.
  const onPick = (choice: string) => {
    // Ignore double taps while feedback is shown
    if (picked) 
        return;     
                          
    // Lock in the selected choice (triggers feedback colors)
    setPicked(choice);                            

    // Elapsed time for this question in ms
    const dt = Date.now() - t0.current;            

    // Append to times array (immutable update)
    setTimes(prev => [...prev, dt]);               

    // If correct, increment score
    if (choice === q.correct)                      
      setScore(s => s + 1);

   // After a short delay to show feedback, advance to the next question or results.
    setTimeout(() => {
        // More questions remaining
        if (i + 1 < qs.length) {                     
            // Move to next question
            setI(i + 1);                               

            // Clear selection for the next one
            setPicked(null);                           
        } else {
            // Finished all questions; keep 'picked' set so the UI remains stable before showing results.
            setPicked(choice);
            
            // Advance index to qs.length so the results branch renders
            setI(qs.length);
        }
    }, 400);                                   
  };

  // If we've answered all questions, render the results view.
  if (i >= qs.length) {
    // Total questions (for now: 10)
    const total = qs.length;  
    
    // Arithmetic mean in ms                                      
    const avgMs = times.length
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)  
      : 0;

    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Results</Text>
        <Text>Score: {score} / {total}</Text>                        
        <Text>Avg time/question: {(avgMs / 1000).toFixed(2)} s</Text> 
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            
        <Button title="Restart" onPress={() => {
            setSeed(s => s + 1);   
            setI(0);               
            setScore(0);           
            setTimes([]);          
            setPicked(null);       
        }}/>

        <Button title="Back to Home" onPress={() => router.back()} />
        </View>
      </ScrollView>
    );
  }

  // Otherwise, render the active question view.
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 16, color: "#666" }}>
        Question {i + 1} / {qs.length}
      </Text>

      <Text style={{ fontSize: 20, fontWeight: "700" }}>{q.prompt}</Text>

      <View style={{ gap: 8 }}>
        {q.choices.map((c) => {
          // Boolean: is this the one the user tapped?
          const isPicked = picked === c;           

          // Boolean: is this the correct choice?
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