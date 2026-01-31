import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function ResultScreen() {
  const { score, total } = useLocalSearchParams();
  const router = useRouter();
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const currentScore = Number(score);
    setHighScore((prev) => (currentScore > prev ? currentScore : prev));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Completed 🎉</Text>
      <Text style={styles.text}>Your Score: {score} / {total}</Text>
      <Text style={styles.text}>Highest Score: {highScore}</Text>

      <Button title="Play Again" onPress={() => router.replace("/")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});
