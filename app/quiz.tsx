import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { questions } from "../questions";

export default function QuizScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (choice: string) => {
    const updatedAnswers: Record<number, string | string[]> = { ...answers, [currentIndex]: choice };
    setAnswers(updatedAnswers);

    let newScore = 0;
    if (updatedAnswers) {
      Object.keys(updatedAnswers).forEach((key) => {
        const idx = Number(key);
        const correct = questions[idx].answer;
        const user = updatedAnswers[idx];

        if (Array.isArray(correct)) {
          if (typeof user === "string" && correct.includes(user)) {
            newScore++;
          }
        } else {
          if (user === correct) {
            newScore++;
          }
        }
      });
    }

    setScore(newScore);
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push({
        pathname: "/result",
        params: { score, total: questions.length },
      });
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>
        {currentIndex + 1}. {currentQuestion.question}
      </Text>

      {Object.entries(currentQuestion.choices).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.choice,
            answers[currentIndex] === key && styles.selected,
          ]}
          onPress={() => handleAnswer(key)}
        >
          <Text>{key}. {value}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.navigation}>
        <Button title="Previous" onPress={goPrevious} disabled={currentIndex === 0} />
        <Button title={currentIndex === questions.length - 1 ? "Finish" : "Next"} onPress={goNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  question: {
    fontSize: 18,
    marginBottom: 15,
  },
  choice: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  selected: {
    backgroundColor: "#d0ebff",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});
