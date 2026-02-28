import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS, FONTS, SHADOW } from "../../constants/theme";
import { useQuiz } from "../../context/QuizContext";

// ─── Timer Strip ─────────────────────────────────────────────────────────────

function TimerStrip({
  seconds,
  total,
}: {
  seconds: number;
  total: number;
}) {
  const pct   = total > 0 ? seconds / total : 1;
  const mins  = Math.floor(seconds / 60);
  const secs  = seconds % 60;
  const color =
    pct > 0.4
      ? COLORS.olive
      : pct > 0.15
      ? COLORS.warnOrange
      : COLORS.wrong;

  return (
    <View style={timerStyles.wrap}>
      <View style={timerStyles.row}>
        <Text style={[timerStyles.label, { color }]}>⏱  TIME REMAINING</Text>
        <Text style={[timerStyles.value, { color }]}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </Text>
      </View>
      <View style={timerStyles.track}>
        <View
          style={[
            timerStyles.fill,
            { width: `${pct * 100}%` as any, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const timerStyles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.parchment,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    letterSpacing: 2,
  },
  value: {
    fontFamily: FONTS.mono,
    fontSize: 22,
    fontWeight: "700",
  },
  track: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
});

// ─── Results Screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  score,
  total,
  questions,
  answers,
  onRetake,
}: {
  score: number;
  total: number;
  questions: any[];
  answers: Record<number, string | string[]>;
  onRetake: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const grade =
    pct >= 90 ? "Distinction ✦"
    : pct >= 75 ? "Proficient"
    : pct >= 60 ? "Satisfactory"
    : pct >= 40 ? "Needs Review"
    : "Insufficient";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.cream }}
      contentContainerStyle={rs.container}
    >
      {/* Score Card */}
      <View style={rs.scoreCard}>
        <Text style={rs.ornament}>✦ ─── ✦ ─── ✦</Text>
        <Text style={rs.scoreLabel}>FINAL SCORE</Text>
        <Text style={rs.scoreNum}>{score}<Text style={rs.scoreTotal}>/{total}</Text></Text>
        <Text style={rs.pct}>{pct}%</Text>
        <Text style={rs.grade}>{grade}</Text>
        <Text style={rs.ornament}>✦ ─── ✦ ─── ✦</Text>
      </View>

      {/* Per-question review */}
      {questions.map((q, i) => {
        const userAns = answers[i];
        const correct = q.answer;
        const isCorrect = Array.isArray(correct)
          ? Array.isArray(userAns) &&
            [...correct].sort().join() === [...(userAns as string[])].sort().join()
          : userAns === correct;

        return (
          <View key={q.id} style={[rs.reviewCard, isCorrect ? rs.cardCorrect : rs.cardWrong]}>
            <View style={rs.reviewHeader}>
              <Text style={rs.reviewNum}>Q{i + 1}</Text>
              <Text style={isCorrect ? rs.tick : rs.cross}>
                {isCorrect ? "✓ Correct" : "✗ Incorrect"}
              </Text>
            </View>
            <Text style={rs.reviewQ}>{q.question}</Text>
            {Object.entries(q.choices).map(([key, val]) => {
              const isAns = Array.isArray(correct)
                ? correct.includes(key)
                : correct === key;
              const isUser = Array.isArray(userAns)
                ? userAns.includes(key)
                : userAns === key;
              return (
                <View
                  key={key}
                  style={[
                    rs.reviewOpt,
                    isAns && rs.reviewOptCorrect,
                    isUser && !isAns && rs.reviewOptWrong,
                  ]}
                >
                  <Text style={rs.reviewOptText}>
                    {isAns ? "✓ " : isUser && !isAns ? "✗ " : "  "}
                    {key}. {val as string}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}

      <TouchableOpacity style={rs.retakeBtn} onPress={onRetake}>
        <Text style={rs.retakeBtnText}>↺  RETAKE QUIZ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const rs = StyleSheet.create({
  container:      { padding: 16, paddingBottom: 48 },
  scoreCard:      {
    backgroundColor: COLORS.darkBrown,
    borderRadius: 12,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
    ...SHADOW,
  },
  ornament:       { fontFamily: FONTS.serif, fontSize: 12, color: COLORS.tan, letterSpacing: 2 },
  scoreLabel:     { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, letterSpacing: 3, marginTop: 12 },
  scoreNum:       { fontFamily: FONTS.serif, fontSize: 56, fontWeight: "700", color: COLORS.cream, marginTop: 4 },
  scoreTotal:     { fontSize: 28, color: COLORS.tan },
  pct:            { fontFamily: FONTS.mono, fontSize: 22, color: COLORS.tan },
  grade:          { fontFamily: FONTS.serif, fontSize: 16, color: COLORS.lightTan, marginTop: 4, marginBottom: 12 },
  reviewCard:     { borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardCorrect:    { backgroundColor: "#EAF2EA" },
  cardWrong:      { backgroundColor: "#F2EAEA" },
  reviewHeader:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  reviewNum:      { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, letterSpacing: 2 },
  tick:           { fontFamily: FONTS.serif, fontSize: 12, color: COLORS.correct, fontWeight: "700" },
  cross:          { fontFamily: FONTS.serif, fontSize: 12, color: COLORS.wrong, fontWeight: "700" },
  reviewQ:        { fontFamily: FONTS.serif, fontSize: 14, color: COLORS.darkBrown, marginBottom: 10, lineHeight: 20 },
  reviewOpt:      { paddingVertical: 5, paddingHorizontal: 8, borderRadius: 4, marginBottom: 3 },
  reviewOptCorrect: { backgroundColor: "#C8E6C8" },
  reviewOptWrong:   { backgroundColor: "#E6C8C8" },
  reviewOptText:  { fontFamily: FONTS.serif, fontSize: 13, color: COLORS.darkBrown },
  retakeBtn:      {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLORS.darkBrown,
    alignItems: "center",
    ...SHADOW,
  },
  retakeBtnText:  { fontFamily: FONTS.serif, fontSize: 14, color: COLORS.tan, letterSpacing: 2, fontWeight: "700" },
});

// ─── Main Preview Quiz Screen ─────────────────────────────────────────────────

export default function PreviewQuizScreen() {
  const { questions, timerSeconds } = useQuiz();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState<Record<number, string | string[]>>({});
  const [score, setScore]               = useState(0);
  const [submitted, setSubmitted]       = useState(false);
  const [timeLeft, setTimeLeft]         = useState<number | null>(
    timerSeconds > 0 ? timerSeconds : null
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when questions or timer changes
  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
    setScore(0);
    setSubmitted(false);
    setTimeLeft(timerSeconds > 0 ? timerSeconds : null);
  }, [questions, timerSeconds]);


  // ── Submit logic (moved up so the countdown effect can reference it) ──
  // make submit callback stable so effect deps are happy
  const handleSubmit = React.useCallback((auto = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // calculate score inline
    let finalScore = 0;
    questions.forEach((q, idx) => {
      const user = answers[idx];
      const correct = q.answer;
      if (!user) return;
      if (Array.isArray(correct)) {
        if (Array.isArray(user) && [...correct].sort().join() === [...user].sort().join()) finalScore++;
      } else {
        if (user === correct) finalScore++;
      }
    });
    setScore(finalScore);
    if (auto) {
      // immediately mark as submitted so the UI updates without waiting for
      // the user to tap the alert button. the button simply closes the dialog.
      setSubmitted(true);
      Alert.alert("⏰ Time's Up!", "Your quiz has been automatically submitted.", [
        { text: "See Results" /* already submitted */ },
      ]);
    } else {
      setSubmitted(true);
    }
  }, [answers, questions]);

  // if the timer is already expired (e.g. zero on arrival), submit immediately
  useEffect(() => {
    if (!submitted && timeLeft !== null && timeLeft <= 0) {
      handleSubmit(true);
    }
  }, [timeLeft, submitted, handleSubmit]);

  // Countdown
  // countdown effect; include handleSubmit so linter/TS have it in deps
  useEffect(() => {
    if (submitted || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => (t ?? 1) - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, submitted, handleSubmit]);

  // ── Empty state ──
  if (!questions || questions.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No Questions Available</Text>
        <Text style={styles.emptySub}>
          Go to the “Quiz Settings” tab to add your first question.
        </Text>
      </View>
    );
  }


  const handleAnswer = (key: string) => {
    const q = questions[currentIndex];
    if (q.type === "checkbox") {
      const prev = (answers[currentIndex] as string[] | undefined) ?? [];
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      setAnswers((a) => ({ ...a, [currentIndex]: next }));
    } else {
      setAnswers((a) => ({ ...a, [currentIndex]: key }));
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setAnswers({});
    setScore(0);
    setSubmitted(false);
    setTimeLeft(timerSeconds > 0 ? timerSeconds : null);
  };

  // ── Results ──
  if (submitted) {
    return (
      <ResultsScreen
        score={score}
        total={questions.length}
        questions={questions}
        answers={answers}
        onRetake={handleRetake}
      />
    );
  }

  // ── Quiz ──
  const q           = questions[currentIndex];
  const isLast      = currentIndex === questions.length - 1;
  const allAnswered = questions.every((_, i) => {
    const ans = answers[i];
    if (!ans) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    return true;
  });
  const currAns = answers[currentIndex];

  const isSelected = (key: string) => {
    if (q.type === "checkbox") return (currAns as string[] | undefined)?.includes(key) ?? false;
    return currAns === key;
  };

  return (
    <View style={styles.root}>
      {/* Timer */}
      {timeLeft !== null && (
        <TimerStrip seconds={timeLeft} total={timerSeconds} />
      )}

      {/* Progress dots */}
      <View style={styles.progressRow}>
        {questions.map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.dot,
              i === currentIndex && styles.dotActive,
              answers[i] !== undefined && i !== currentIndex && styles.dotAnswered,
            ]}
            onPress={() => setCurrentIndex(i)}
          />
        ))}
      </View>
      <Text style={styles.progressLabel}>
        Question {currentIndex + 1} of {questions.length}
        {q.type === "checkbox" ? "  ·  Select all that apply" : ""}
      </Text>

      {/* Question + choices */}
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* Type badge */}
        <View style={styles.typeBadgeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {q.type === "multiple"   ? "MULTIPLE CHOICE"
               : q.type === "truefalse" ? "TRUE / FALSE"
               : "CHECKBOX"}
            </Text>
          </View>
        </View>

        {/* Question card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionNum}>✦ {currentIndex + 1} ✦</Text>
          <Text style={styles.questionText}>{q.question}</Text>
        </View>

        {/* Choices */}
        {Object.entries(q.choices).map(([key, val]) => {
          const sel = isSelected(key);
          return (
            <TouchableOpacity
              key={key}
              style={[styles.choiceBtn, sel && styles.choiceBtnSel]}
              onPress={() => handleAnswer(key)}
              activeOpacity={0.75}
            >
              <View style={[styles.choiceLetter, sel && styles.choiceLetterSel]}>
                <Text style={[styles.choiceLetterText, sel && styles.choiceLetterTextSel]}>
                  {key}
                </Text>
              </View>
              <Text style={[styles.choiceText, sel && styles.choiceTextSel]}>
                {val as string}
              </Text>
              {sel && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navBtnText}>← PREV</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            style={[styles.submitBtn, !allAnswered && styles.submitBtnDisabled]}
            onPress={() => handleSubmit(false)}
            disabled={!allAnswered}
          >
            <Text style={styles.submitBtnText}>SUBMIT ✓</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setCurrentIndex((i) => i + 1)}
          >
            <Text style={styles.navBtnText}>NEXT →</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLast && !allAnswered && (
        <Text style={styles.hintText}>Answer all questions to enable submit.</Text>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  // Empty
  emptyWrap: {
    flex: 1,
    backgroundColor: COLORS.cream,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon:  { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontFamily: FONTS.serif, fontSize: 20, fontWeight: "700", color: COLORS.darkBrown, marginBottom: 8 },
  emptySub:   { fontFamily: FONTS.serif, fontSize: 14, color: COLORS.muted, textAlign: "center", lineHeight: 22 },

  // Progress
  progressRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.parchment,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  dotActive:    { borderColor: COLORS.rust,  backgroundColor: COLORS.rust },
  dotAnswered:  { borderColor: COLORS.olive, backgroundColor: COLORS.olive },
  progressLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 1.5,
    marginTop: 6,
    marginHorizontal: 16,
  },

  // Question
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  typeBadgeRow: { alignItems: "flex-start", marginBottom: 8 },
  typeBadge: {
    backgroundColor: COLORS.rust,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.cream,
    letterSpacing: 2,
  },
  questionCard: {
    backgroundColor: COLORS.darkBrown,
    borderRadius: 10,
    padding: 20,
    marginBottom: 14,
    ...SHADOW,
  },
  questionNum:  { fontFamily: FONTS.serif, fontSize: 12, color: COLORS.tan, letterSpacing: 4, textAlign: "center", marginBottom: 10 },
  questionText: { fontFamily: FONTS.serif, fontSize: 18, color: COLORS.cream, lineHeight: 28, textAlign: "center" },

  // Choices
  choiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.parchment,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 10,
    padding: 13,
    ...SHADOW,
    shadowOpacity: 0.08,
    elevation: 1,
  },
  choiceBtnSel: {
    backgroundColor: COLORS.brown,
    borderColor: COLORS.brown,
  },
  choiceLetter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.aged,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  choiceLetterSel: {
    backgroundColor: COLORS.tan,
    borderColor: COLORS.tan,
  },
  choiceLetterText:    { fontFamily: FONTS.serif, fontSize: 13, fontWeight: "700", color: COLORS.rust },
  choiceLetterTextSel: { color: COLORS.darkBrown },
  choiceText:    { fontFamily: FONTS.serif, fontSize: 15, color: COLORS.darkBrown, flex: 1, lineHeight: 22 },
  choiceTextSel: { color: COLORS.cream },
  checkMark:     { fontFamily: FONTS.serif, fontSize: 16, color: COLORS.tan, marginLeft: 4 },

  // Nav
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.cream,
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: COLORS.tan,
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.brown,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 7,
    backgroundColor: COLORS.darkBrown,
    ...SHADOW,
  },
  submitBtnDisabled: { opacity: 0.35 },
  submitBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.tan,
    letterSpacing: 2,
    fontWeight: "700",
  },
  hintText: {
    textAlign: "center",
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.muted,
    paddingBottom: 8,
    fontStyle: "italic",
  },
});