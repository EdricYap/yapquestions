import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, FONTS, SHADOW } from "../../constants/theme";
import { QuestionType, QuizQuestion, useQuiz } from "../../context/QuizContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OPTION_KEYS = ["A", "B", "C", "D"];

const blankForm = (): Omit<QuizQuestion, "id"> => ({
  type: "multiple",
  question: "",
  choices: { A: "", B: "", C: "", D: "" },
  answer: "",
});

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={sh.wrap}>
      <Text style={sh.icon}>{icon}</Text>
      <Text style={sh.title}>{title}</Text>
      <View style={sh.line} />
    </View>
  );
}

const sh = StyleSheet.create({
  wrap:  { marginBottom: 10 },
  icon:  { fontSize: 18, marginBottom: 2 },
  title: { fontFamily: FONTS.serif, fontSize: 17, fontWeight: "700", color: COLORS.darkBrown, letterSpacing: 0.5 },
  line:  { height: 1.5, backgroundColor: COLORS.border, marginTop: 6 },
});

// ─── Guide Tip ────────────────────────────────────────────────────────────────

function Tip({ text }: { text: string }) {
  return (
    <View style={tip.wrap}>
      <Text style={tip.icon}>ℹ</Text>
      <Text style={tip.text}>{text}</Text>
    </View>
  );
}

const tip = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: COLORS.parchment,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.tan,
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  icon: { fontSize: 13, color: COLORS.tan, marginTop: 1 },
  text: { fontFamily: FONTS.serif, fontSize: 12, color: COLORS.muted, flex: 1, lineHeight: 18, fontStyle: "italic" },
});

// ─── Question List Item ───────────────────────────────────────────────────────

function QuestionItem({
  item,
  index,
  onEdit,
  onDelete,
}: {
  item: QuizQuestion;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const answerLabel = Array.isArray(item.answer)
    ? item.answer.map((k) => `${k}. ${item.choices[k]}`).join(", ")
    : `${item.answer}. ${item.choices[item.answer as string]}`;

  return (
    <View style={qi.card}>
      <View style={qi.left}>
        <View style={qi.numBadge}>
          <Text style={qi.numText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={qi.qText} numberOfLines={2}>{item.question}</Text>
          <Text style={qi.answerText}>✓ {answerLabel}</Text>
          <View style={qi.typePill}>
            <Text style={qi.typeText}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <View style={qi.actions}>
        <TouchableOpacity style={qi.editBtn} onPress={onEdit}>
          <Text style={qi.editIcon}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={qi.delBtn} onPress={onDelete}>
          <Text style={qi.delIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const qi = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
    shadowOpacity: 0.07,
    elevation: 1,
  },
  left:     { flex: 1, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  numBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.rust, alignItems: "center", justifyContent: "center", marginTop: 2 },
  numText:  { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.cream, fontWeight: "700" },
  qText:    { fontFamily: FONTS.serif, fontSize: 13, color: COLORS.darkBrown, lineHeight: 19, marginBottom: 3 },
  answerText: { fontFamily: FONTS.serif, fontSize: 11, color: COLORS.olive, marginBottom: 5 },
  typePill: { alignSelf: "flex-start", backgroundColor: COLORS.aged, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 },
  typeText: { fontFamily: FONTS.mono, fontSize: 8, color: COLORS.brown, letterSpacing: 1.5 },
  actions:  { flexDirection: "row", gap: 6, marginLeft: 8 },
  editBtn:  { width: 32, height: 32, borderRadius: 6, backgroundColor: COLORS.parchment, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  editIcon: { fontSize: 16, color: COLORS.brown },
  delBtn:   { width: 32, height: 32, borderRadius: 6, backgroundColor: "#F2E8E8", borderWidth: 1, borderColor: "#D4B0B0", alignItems: "center", justifyContent: "center" },
  delIcon:  { fontSize: 13, color: COLORS.wrong, fontWeight: "700" },
});

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function QuestionModal({
  visible,
  editing,
  onClose,
  onSave,
}: {
  visible: boolean;
  editing: QuizQuestion | null;
  onClose: () => void;
  onSave: (q: Omit<QuizQuestion, "id">) => void;
}) {
  const [form, setForm] = useState<Omit<QuizQuestion, "id">>(blankForm());

  // Sync form when modal opens
  React.useEffect(() => {
    if (visible) {
      setForm(
        editing
          ? { type: editing.type, question: editing.question, choices: { ...editing.choices }, answer: editing.answer }
          : blankForm()
      );
    }
  }, [visible, editing]);

  const setType = (t: QuestionType) => {
    // ensure our choices object always matches the Record<string,string> shape
    const newChoices: Record<string, string> =
      t === "truefalse"
        ? { A: "True", B: "False", C: "", D: "" }
        : { A: form.choices.A ?? "", B: form.choices.B ?? "", C: form.choices.C ?? "", D: form.choices.D ?? "" };
    setForm((f) => ({ ...f, type: t, choices: newChoices, answer: "" }));
  };

  const setOption = (key: string, val: string) =>
    setForm((f) => ({ ...f, choices: { ...f.choices, [key]: val } }));

  const setAnswer = (key: string) => {
    if (form.type === "checkbox") {
      const prev = (form.answer as string[]) ?? [];
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      setForm((f) => ({ ...f, answer: next }));
    } else {
      setForm((f) => ({ ...f, answer: key }));
    }
  };

  const isAnswerSel = (key: string) =>
    form.type === "checkbox"
      ? (form.answer as string[])?.includes(key) ?? false
      : form.answer === key;

  const validate = () => {
    if (!form.question.trim()) { Alert.alert("Missing Field", "Please enter a question."); return false; }
    const keys = form.type === "truefalse" ? ["A", "B"] : OPTION_KEYS;
    if (keys.some((k) => !(form.choices[k] ?? "").trim())) {
      Alert.alert("Missing Field", "All options must be filled in.");
      return false;
    }
    const ans = form.answer;
    if (!ans || (Array.isArray(ans) && ans.length === 0)) {
      Alert.alert("Missing Field", "Please select the correct answer.");
      return false;
    }
    return true;
  };

  const handleSave = () => { if (validate()) onSave(form); };

  const optionKeys = form.type === "truefalse" ? ["A", "B"] : OPTION_KEYS;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        style={m.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={m.card}>
          {/* Handle */}
          <View style={m.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={m.title}>{editing ? "✎  Edit Question" : "＋  New Question"}</Text>

            {/* ── Question Type ── */}
            <Text style={m.label}>QUESTION TYPE</Text>
            <View style={m.typeRow}>
              {(["multiple", "truefalse", "checkbox"] as QuestionType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[m.typePill, form.type === t && m.typePillSel]}
                  onPress={() => setType(t)}
                >
                  <Text style={[m.typePillText, form.type === t && m.typePillTextSel]}>
                    {t === "multiple" ? "Multiple" : t === "truefalse" ? "True/False" : "Checkbox"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Question Text ── */}
            <Text style={m.label}>QUESTION</Text>
            <TextInput
              style={m.input}
              value={form.question}
              onChangeText={(v) => setForm((f) => ({ ...f, question: v }))}
              placeholder="Type your question here…"
              placeholderTextColor={COLORS.muted}
              multiline
            />

            {/* ── Options ── */}
            <Text style={m.label}>
              {form.type === "truefalse" ? "OPTIONS (fixed)" : "OPTIONS  (A – D)"}
            </Text>
            {optionKeys.map((key) => (
              <View key={key} style={m.optRow}>
                <View style={m.optLetter}>
                  <Text style={m.optLetterText}>{key}</Text>
                </View>
                <TextInput
                  style={[m.optInput, form.type === "truefalse" && m.optInputDisabled]}
                  value={form.choices[key] ?? ""}
                  onChangeText={(v) => setOption(key, v)}
                  placeholder={`Option ${key}`}
                  placeholderTextColor={COLORS.muted}
                  editable={form.type !== "truefalse"}
                />
              </View>
            ))}

            {/* ── Correct Answer ── */}
            <Text style={m.label}>
              {form.type === "checkbox" ? "CORRECT ANSWERS  (tap all that apply)" : "CORRECT ANSWER"}
            </Text>
            <View style={m.answerGrid}>
              {optionKeys
                .filter((k) => (form.choices[k] ?? "").trim())
                .map((key) => {
                  const sel = isAnswerSel(key);
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[m.answerOpt, sel && m.answerOptSel]}
                      onPress={() => setAnswer(key)}
                    >
                      <Text style={[m.answerOptText, sel && m.answerOptTextSel]}>
                        {sel ? "✓ " : ""}{key}. {form.choices[key]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>

            {/* ── Buttons ── */}
            <View style={m.btnRow}>
              <TouchableOpacity style={m.cancelBtn} onPress={onClose}>
                <Text style={m.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={m.saveBtn} onPress={handleSave}>
                <Text style={m.saveBtnText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: "rgba(28,14,6,0.65)", justifyContent: "flex-end" },
  card:       {
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 38 : 24,
    maxHeight: "92%",
  },
  handle:     { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  title:      { fontFamily: FONTS.serif, fontSize: 18, fontWeight: "700", color: COLORS.darkBrown, marginBottom: 16, letterSpacing: 0.5 },
  label:      { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, letterSpacing: 2, marginBottom: 6, marginTop: 14 },
  input:      { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontFamily: FONTS.serif, fontSize: 14, color: COLORS.darkBrown, minHeight: 52 },
  typeRow:    { flexDirection: "row", gap: 8 },
  typePill:   { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.parchment },
  typePillSel: { backgroundColor: COLORS.darkBrown, borderColor: COLORS.darkBrown },
  typePillText: { fontFamily: FONTS.serif, fontSize: 12, color: COLORS.muted },
  typePillTextSel: { color: COLORS.tan, fontWeight: "700" },
  optRow:     { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
  optLetter:  { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.rust, alignItems: "center", justifyContent: "center" },
  optLetterText: { fontFamily: FONTS.serif, fontSize: 13, fontWeight: "700", color: COLORS.cream },
  optInput:   { flex: 1, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 10, fontFamily: FONTS.serif, fontSize: 13, color: COLORS.darkBrown },
  optInputDisabled: { backgroundColor: COLORS.parchment, color: COLORS.muted },
  answerGrid: { gap: 6 },
  answerOpt:  { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 7, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.parchment },
  answerOptSel: { backgroundColor: COLORS.olive, borderColor: COLORS.olive },
  answerOptText: { fontFamily: FONTS.serif, fontSize: 13, color: COLORS.darkBrown },
  answerOptTextSel: { color: COLORS.cream, fontWeight: "700" },
  btnRow:     { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 22 },
  cancelBtn:  { paddingVertical: 11, paddingHorizontal: 22, borderRadius: 7, borderWidth: 1.5, borderColor: COLORS.border },
  cancelBtnText: { fontFamily: FONTS.serif, fontSize: 13, color: COLORS.muted, letterSpacing: 1 },
  saveBtn:    { paddingVertical: 11, paddingHorizontal: 28, borderRadius: 7, backgroundColor: COLORS.darkBrown, ...SHADOW },
  saveBtnText: { fontFamily: FONTS.serif, fontSize: 13, color: COLORS.tan, letterSpacing: 1.5, fontWeight: "700" },
});

// ─── Main Settings Screen ─────────────────────────────────────────────────────

export default function QuizSettingsScreen() {
  const { questions, setQuestions, timerSeconds, setTimerSeconds } = useQuiz();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing]           = useState<QuizQuestion | null>(null);
  const [timerInput, setTimerInput]     = useState(String(timerSeconds));

  const openAdd  = () => { setEditing(null); setModalVisible(true); };
  const openEdit = (q: QuizQuestion) => { setEditing(q); setModalVisible(true); };

  const handleSave = (form: Omit<QuizQuestion, "id">) => {
    if (editing) {
      setQuestions((qs) => qs.map((q) => (q.id === editing.id ? { ...form, id: editing.id } : q)));
    } else {
      const newId = Date.now();
      setQuestions((qs) => [...qs, { ...form, id: newId }]);
    }
    setModalVisible(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Remove Question", "Are you sure you want to delete this question?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setQuestions((qs) => qs.filter((q) => q.id !== id)) },
    ]);
  };

  const handleTimerSave = () => {
    const val = parseInt(timerInput, 10);
    if (isNaN(val) || val < 0) {
      Alert.alert("Invalid Input", "Enter a whole number of seconds (0 to disable the timer).");
      return;
    }
    setTimerSeconds(val);
    Alert.alert(
      "Timer Saved",
      val === 0
        ? "Timer is now disabled."
        : `Timer set to ${Math.floor(val / 60)}m ${val % 60}s.`
    );
  };

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* ══ Timer Section ══════════════════════════════════════════════════════ */}
      <SectionHeader icon="⏱" title="Quiz Timer" />
      <Tip text="Set a total countdown in seconds. When time runs out, the quiz automatically submits. Enter 0 to turn the timer off." />

      <View style={s.timerCard}>
        <View style={s.timerRow}>
          <TextInput
            style={s.timerInput}
            value={timerInput}
            onChangeText={setTimerInput}
            keyboardType="numeric"
            placeholder="e.g. 120"
            placeholderTextColor={COLORS.muted}
          />
          <Text style={s.timerUnit}>seconds</Text>
          <TouchableOpacity style={s.timerSaveBtn} onPress={handleTimerSave}>
            <Text style={s.timerSaveBtnText}>SAVE</Text>
          </TouchableOpacity>
        </View>

        {/* Quick presets */}
        <View style={s.presetRow}>
          {[
            { label: "OFF",  val: 0   },
            { label: "1 min", val: 60  },
            { label: "2 min", val: 120 },
            { label: "5 min", val: 300 },
          ].map(({ label, val }) => (
            <TouchableOpacity
              key={label}
              style={[s.preset, timerSeconds === val && s.presetActive]}
              onPress={() => { setTimerInput(String(val)); setTimerSeconds(val); }}
            >
              <Text style={[s.presetText, timerSeconds === val && s.presetTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {timerSeconds > 0 && (
          <View style={s.timerActive}>
            <Text style={s.timerActiveText}>
              ✓  Active — {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s
            </Text>
          </View>
        )}
      </View>

      {/* ══ Questions Section ══════════════════════════════════════════════════ */}
      <View style={s.sectionHeaderRow}>
        <SectionHeader icon="📋" title={`Questions  (${questions.length})`} />
        <TouchableOpacity style={s.addBtn} onPress={openAdd}>
          <Text style={s.addBtnText}>＋ ADD</Text>
        </TouchableOpacity>
      </View>

      <Tip text="Tap ✎ to edit a question or ✕ to remove it. Supports multiple-choice, true/false, and checkbox (multi-answer) types." />

      {questions.length === 0 ? (
        <View style={s.emptyList}>
          <Text style={s.emptyListText}>No questions yet. Tap “＋ ADD” to create your first one.</Text>
        </View>
      ) : (
        questions.map((q, i) => (
          <QuestionItem
            key={q.id}
            item={q}
            index={i}
            onEdit={() => openEdit(q)}
            onDelete={() => handleDelete(q.id)}
          />
        ))
      )}

      {/* Modal */}
      <QuestionModal
        visible={modalVisible}
        editing={editing}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: 16, paddingBottom: 48 },

  // Timer card
  timerCard: {
    backgroundColor: COLORS.parchment,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    ...SHADOW,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  timerRow:     { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  timerInput:   { width: 90, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 7, paddingVertical: 9, paddingHorizontal: 12, fontFamily: FONTS.mono, fontSize: 18, color: COLORS.darkBrown, backgroundColor: COLORS.white, textAlign: "center" },
  timerUnit:    { fontFamily: FONTS.serif, fontSize: 13, color: COLORS.muted, flex: 1 },
  timerSaveBtn: { backgroundColor: COLORS.brown, paddingVertical: 9, paddingHorizontal: 18, borderRadius: 7 },
  timerSaveBtnText: { fontFamily: FONTS.serif, fontSize: 12, color: COLORS.cream, fontWeight: "700", letterSpacing: 1 },
  presetRow:    { flexDirection: "row", gap: 7, marginBottom: 10 },
  preset:       { flex: 1, paddingVertical: 7, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, alignItems: "center" },
  presetActive: { backgroundColor: COLORS.darkBrown, borderColor: COLORS.darkBrown },
  presetText:   { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, letterSpacing: 0.5 },
  presetTextActive: { color: COLORS.tan, fontWeight: "700" },
  timerActive:  { backgroundColor: "#E8F0E8", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, alignSelf: "flex-start" },
  timerActiveText: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.olive, letterSpacing: 0.5 },

  // Questions header
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  addBtn:           { marginTop: 2, backgroundColor: COLORS.rust, paddingVertical: 7, paddingHorizontal: 16, borderRadius: 7, ...SHADOW, shadowOpacity: 0.2 },
  addBtnText:       { fontFamily: FONTS.serif, fontSize: 13, color: COLORS.cream, fontWeight: "700", letterSpacing: 1 },

  // Empty list
  emptyList:     { paddingVertical: 24, alignItems: "center" },
  emptyListText: { fontFamily: FONTS.serif, fontSize: 14, color: COLORS.muted, fontStyle: "italic", textAlign: "center" },
});