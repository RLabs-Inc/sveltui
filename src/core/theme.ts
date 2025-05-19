// Import types from the main types file
import type { Color, Theme } from "./types";

// Re-export types for backward compatibility
export type { Color, Theme };

// Default theme - uses terminal colors
export const TerminalTheme: Theme = {
  name: "Terminal",
  description: "Uses the terminal's default colors",
  author: "RLabs Inc.",
  version: "1.0.0",

  colors: {
    // Basic colors - use terminal defaults
    primary: "blue",
    secondary: "cyan",
    background: null, // null = use terminal default
    foreground: null, // null = use terminal default

    // Status colors
    success: "green",
    warning: "yellow",
    error: "red",
    info: "blue",
  },
};

// Dark theme - for users who want a specific look
export const DarkTheme: Theme = {
  name: "Dark",
  description: "A dark theme with good contrast",
  author: "RLabs Inc.",
  version: "1.0.0",

  colors: {
    primary: "#4a7fff",
    secondary: "#00ccbb",
    background: "#121212",
    foreground: "#ffffff",

    success: "#00cc66",
    warning: "#ffcc00",
    error: "#ff4d4d",
    info: "#66ccff",
  },

  derived: {
    surfaceColor: "#1e1e1e",
    mutedText: "#aaaaaa",
  },
};

// Light theme - for users who prefer light backgrounds
export const LightTheme: Theme = {
  name: "Light",
  description: "A light theme with good contrast",
  author: "RLabs Inc.",
  version: "1.0.0",

  colors: {
    primary: "#0066cc",
    secondary: "#009988",
    background: "#f5f5f5",
    foreground: "#333333",

    success: "#00aa44",
    warning: "#dd9900",
    error: "#cc3333",
    info: "#0088cc",
  },

  derived: {
    surfaceColor: "#ffffff",
    mutedText: "#777777",
  },
};
