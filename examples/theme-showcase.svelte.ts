import {
  initializeScreen,
  render,
  setTheme,
  loadTheme,
  getThemeFiles,
  type Theme,
} from "../src/core/renderer.svelte.ts";
import {
  TerminalTheme,
  DarkTheme,
  LightTheme,
} from "../src/theme/theme.svelte.ts";
import * as path from "path";

// Just use TerminalTheme as the default
let activeTheme = $state<Theme>(TerminalTheme);
let currentThemeName = $state("Terminal");
let selectedIndex = $state(0);

// Helper function to safely get color with fallback
function getThemeColor(
  color: string | null | undefined,
  fallback: string
): string {
  return color || fallback;
}

// Get available themes
const themeFiles = getThemeFiles();
const themeNames = [
  "Terminal",
  "Dark",
  "Light",
  ...themeFiles.builtIn.map((file) => path.basename(file, path.extname(file))),
  ...themeFiles.custom.map((file) => path.basename(file, path.extname(file))),
];

// Initialize the screen
const screen = initializeScreen({
  title: "SvelTUI Theme Showcase",
});

// Create a main container with more room for elements
const main = render("box", {
  width: "100%",
  height: "100%",
  border: true,
  scrollable: true,
});

// Create a header
const header = render("text", {
  parent: main.element,
  top: 1,
  left: "center",
  content: "SvelTUI Theme Showcase",
  style: {
    bold: true,
    fg: getThemeColor(activeTheme.colors.primary, "blue"), // Use the theme's primary color
  },
});

// Theme info section
const themeInfoBox = render("box", {
  parent: main.element,
  top: 3,
  left: "center",
  width: "80%",
  height: 3,
  border: true,
  label: " Current Theme ",
  style: {
    border: {
      fg: getThemeColor(activeTheme.colors.primary, "blue"), // Use the theme's primary color
    },
  },
});

const themeInfo = render("text", {
  parent: themeInfoBox.element,
  top: 0,
  left: "center",
  content: `Theme: ${currentThemeName} (${
    activeTheme.description || "No description"
  })`,
});

// Create a section to showcase theme colors
const colorBox = render("box", {
  parent: main.element,
  top: 7,
  left: "center",
  width: "80%",
  height: 8,
  border: true,
  label: " Theme Colors ",
  style: {
    border: {
      fg: getThemeColor(activeTheme.colors.secondary, "cyan"), // Use the theme's secondary color
    },
  },
});

// Color swatches - these will update when the theme changes
const primarySwatch = render("box", {
  parent: colorBox.element,
  top: 0,
  left: 1,
  width: 14,
  height: 3,
  content: "Primary",
  align: "center",
  valign: "middle",
  style: {
    bg: getThemeColor(activeTheme.colors.primary, "blue"),
    fg: "white",
    bold: true,
  },
});

const secondarySwatch = render("box", {
  parent: colorBox.element,
  top: 0,
  left: 17,
  width: 14,
  height: 3,
  content: "Secondary",
  align: "center",
  valign: "middle",
  style: {
    bg: getThemeColor(activeTheme.colors.secondary, "cyan"),
    fg: "white",
    bold: true,
  },
});

const successSwatch = render("box", {
  parent: colorBox.element,
  top: 4,
  left: 1,
  width: 14,
  height: 3,
  content: "Success",
  align: "center",
  valign: "middle",
  style: {
    bg: getThemeColor(activeTheme.colors.success, "green"),
    fg: "white",
    bold: true,
  },
});

const warningSwatch = render("box", {
  parent: colorBox.element,
  top: 4,
  left: 17,
  width: 14,
  height: 3,
  content: "Warning",
  align: "center",
  valign: "middle",
  style: {
    bg: getThemeColor(activeTheme.colors.warning, "yellow"),
    fg: "black", // Dark text for better contrast on yellow
    bold: true,
  },
});

const errorSwatch = render("box", {
  parent: colorBox.element,
  top: 4,
  left: 33,
  width: 14,
  height: 3,
  content: "Error",
  align: "center",
  valign: "middle",
  style: {
    bg: getThemeColor(activeTheme.colors.error, "red"),
    fg: "white",
    bold: true,
  },
});

const infoSwatch = render("box", {
  parent: colorBox.element,
  top: 4,
  left: 49,
  width: 14,
  height: 3,
  content: "Info",
  align: "center",
  valign: "middle",
  style: {
    bg: getThemeColor(activeTheme.colors.info, "blue"),
    fg: "white",
    bold: true,
  },
});

// Create a list of themes with navigation fixed colors
const themeList = render("list", {
  parent: main.element,
  top: 16,
  left: "center",
  width: "80%",
  height: 8,
  items: themeNames,
  border: true,
  selected: selectedIndex,
  label: " Available Themes ",
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  style: {
    // Use theme-aware colors for list navigation
    selected: {
      bg: getThemeColor(activeTheme.colors.primary, "blue"),
      fg: "white",
      bold: true,
    },
    border: {
      fg: getThemeColor(activeTheme.colors.primary, "blue"),
    },
  },
});

// Function to apply a theme by name
function applyTheme(themeName: string) {
  try {
    // Clean application, no logs needed
    currentThemeName = themeName;

    let theme: Theme | null = null;

    switch (themeName) {
      case "Terminal":
        theme = TerminalTheme;
        break;
      case "Dark":
        theme = DarkTheme;
        break;
      case "Light":
        theme = LightTheme;
        break;
      default:
        // Try to load from built-in themes
        const builtInFile = themeFiles.builtIn.find(
          (file) =>
            path.basename(file, path.extname(file)).toLowerCase() ===
            themeName.toLowerCase()
        );

        if (builtInFile) {
          theme = loadTheme(builtInFile);
          if (theme) {
            // Theme loaded successfully
          }
        }

        if (!theme) {
          // Try to load from custom themes
          const customFile = themeFiles.custom.find(
            (file) =>
              path.basename(file, path.extname(file)).toLowerCase() ===
              themeName.toLowerCase()
          );

          if (customFile) {
            theme = loadTheme(customFile);
            if (theme) {
              // Custom theme loaded successfully
            }
          }
        }

        // If still no theme, use Terminal theme
        if (!theme) {
          // No theme found, use Terminal as fallback
          theme = TerminalTheme;
        }
    }

    if (theme) {
      // Set the theme globally
      setTheme(theme);

      // Update our local reference to the active theme
      activeTheme = theme;

      // Update theme information display
      themeInfo.update({
        content: `Theme: ${currentThemeName} (${
          theme.description || "No description"
        })`,
      });

      // Update directly with theme colors

      // Update color swatches
      primarySwatch.update({
        style: { bg: getThemeColor(activeTheme.colors.primary, "blue") },
      });
      secondarySwatch.update({
        style: { bg: getThemeColor(activeTheme.colors.secondary, "cyan") },
      });
      successSwatch.update({
        style: { bg: getThemeColor(activeTheme.colors.success, "green") },
      });
      warningSwatch.update({
        style: { bg: getThemeColor(activeTheme.colors.warning, "yellow") },
      });
      errorSwatch.update({
        style: { bg: getThemeColor(activeTheme.colors.error, "red") },
      });
      infoSwatch.update({
        style: { bg: getThemeColor(activeTheme.colors.info, "blue") },
      });

      // Update borders
      themeInfoBox.update({
        style: {
          border: { fg: getThemeColor(activeTheme.colors.primary, "blue") },
        },
      });
      colorBox.update({
        style: {
          border: { fg: getThemeColor(activeTheme.colors.secondary, "cyan") },
        },
      });

      // Update theme list with the new theme color for both border and selection
      themeList.update({
        style: {
          border: { fg: getThemeColor(activeTheme.colors.primary, "blue") },
          selected: {
            bg: getThemeColor(activeTheme.colors.primary, "blue"),
            fg: "white",
            bold: true,
          },
        },
      });

      // Update header
      header.update({
        style: { fg: getThemeColor(activeTheme.colors.primary, "blue") },
      });

      // Force a render to apply all changes
      screen.render();
    }
  } catch (error) {
    console.error("Error applying theme:", error);
  }
}

// Configure list events to update selected index
themeList.element.on("select item", (item, index) => {
  selectedIndex = index as unknown as number;
});

// Handle Enter key for applying the selected theme
screen.key("enter", () => {
  if (
    screen.focused === themeList.element &&
    selectedIndex >= 0 &&
    selectedIndex < themeNames.length
  ) {
    const themeName = themeNames[selectedIndex];
    applyTheme(themeName);
  }
});

// Effect to update UI when the theme changes
$effect(() => {
  // Effect triggered when theme changes
  // This effect will run whenever activeTheme changes
  // Update the UI directly if needed for future enhancements
});

// Instructions
const helpText = render("text", {
  parent: main.element,
  bottom: 2,
  left: "center",
  content: "↑/↓ to navigate | Enter to select theme | 'q' to exit",
  style: {
    fg: getThemeColor(activeTheme.colors.secondary, "cyan"), // Use the theme's secondary color
  },
});

// Exit key
screen.key(["q", "C-c", "escape"], () => process.exit(0));

// Set initial focus
themeList.element.focus();

// Initial render
screen.render();

// Apply the initial theme (Terminal)
applyTheme("Terminal");
