import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "../constants/theme";
import { QuizProvider } from "../context/QuizContext";

// ─── Tab Bar Label ────────────────────────────────────────────────────────────

function TabLabel({
  label,
  focused,
  icon,
}: {
  label: string;
  focused: boolean;
  icon: string;
}) {
  return (
    <View style={[tl.wrap, focused && tl.wrapFocused]}>
      <Text style={tl.icon}>{icon}</Text>
      <Text style={[tl.text, focused && tl.textFocused]}>{label}</Text>
    </View>
  );
}

const tl = StyleSheet.create({
  wrap:        { alignItems: "center", paddingVertical: 4, paddingHorizontal: 10 },
  wrapFocused: {},
  icon:        { fontSize: 16, marginBottom: 2 },
  text:        { fontFamily: FONTS.serif, fontSize: 11, color: COLORS.muted, letterSpacing: 0.5 },
  textFocused: { color: COLORS.darkBrown, fontWeight: "700" },
});

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout() {
  return (
    <QuizProvider>
      {/* App-wide vintage header */}
      <View style={s.appHeader}>
        <Text style={s.appTitle}>YAP QUESTIONS</Text>
        <Text style={s.appSub}>Quiz Application</Text>
      </View>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: s.tabBar,
          tabBarActiveTintColor:   COLORS.darkBrown,
          tabBarInactiveTintColor: COLORS.muted,
          // indicator style is for material/top tabs – not supported on bottom tabs
          tabBarShowLabel:         false,
        }}
      >
        {/* ── Tab 1: Preview Quiz ──────────────────────────────────────── */}
        <Tabs.Screen
          name="tabs/preview-quiz"
          options={{
            title: "Preview Quiz",
            tabBarLabel: "Preview Quiz",
            tabBarIcon: ({ focused }) => (
              <TabLabel label="Preview Quiz" focused={focused} icon="📄" />
            ),
          }}
        />

        {/* ── Tab 2: Quiz Settings ─────────────────────────────────────── */}
        <Tabs.Screen
          name="tabs/quiz-settings"
          options={{
            title: "Quiz Settings",
            tabBarLabel: "Quiz Settings",
            tabBarIcon: ({ focused }) => (
              <TabLabel label="Quiz Settings" focused={focused} icon="⚙️" />
            ),
          }}
        />

        {/* Hide original screens from tab bar — they still exist untouched */}
        <Tabs.Screen name="index"  options={{ href: null }} />
        <Tabs.Screen name="quiz"   options={{ href: null }} />
        <Tabs.Screen name="result" options={{ href: null }} />
      </Tabs>
    </QuizProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  appHeader: {
    paddingTop:        Platform.OS === "ios" ? 54 : 38,
    paddingBottom:     12,
    paddingHorizontal: 20,
    backgroundColor:   COLORS.darkBrown,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.tan,
  },
  appTitle: {
    fontFamily:  FONTS.serif,
    fontSize:    22,
    fontWeight:  "700",
    color:       COLORS.tan,
    letterSpacing: 4,
  },
  appSub: {
    fontFamily:  FONTS.serif,
    fontSize:    10,
    color:       COLORS.muted,
    letterSpacing: 2.5,
    marginTop:   2,
  },
  tabBar: {
    backgroundColor:  COLORS.parchment,
    borderTopWidth:   2,
    borderTopColor:   COLORS.border,
    height:           Platform.OS === "ios" ? 82 : 64,
    paddingBottom:    Platform.OS === "ios" ? 20 : 8,
  },
  tabIndicator: {
    backgroundColor: COLORS.rust,
    height:          2,
    top:             0,
  },
});