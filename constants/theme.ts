import { Platform } from "react-native";

// ─── Vintage Color Palette ────────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  cream:      "#F5ECD7",
  parchment:  "#EAD9B8",
  aged:       "#DFD0A8",
  white:      "#FDF6E3",

  // Browns
  darkBrown:  "#3E2A1A",
  brown:      "#6B4226",
  midBrown:   "#8B5E3C",
  tan:        "#C49A5A",
  lightTan:   "#D4B483",

  // Accents
  rust:       "#9E3D1F",
  olive:      "#5C6B2E",
  mustard:    "#B8860B",
  ink:        "#2C1A0E",

  // Utility
  muted:      "#9B8878",
  border:     "#C4A87A",
  shadow:     "#1A0E06",
  correct:    "#3A6B3A",
  wrong:      "#7A2A2A",
  warnOrange: "#C06010",
};

export const FONTS = {
  serif:   Platform.OS === "ios" ? "Georgia"      : "serif",
  mono:    Platform.OS === "ios" ? "Courier New"  : "monospace",
};

// ─── Shared Shadow ────────────────────────────────────────────────────────────
export const SHADOW = {
  shadowColor:   COLORS.shadow,
  shadowOffset:  { width: 0, height: 3 },
  shadowOpacity: 0.22,
  shadowRadius:  5,
  elevation:     4,
};