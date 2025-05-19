import { 
  initializeScreen,
  render, 
  setTheme, 
  loadTheme,
  getAvailableThemes,
  getThemeFiles,
  DarkTheme,
  LightTheme,
  TerminalTheme,
  createTheme
} from "../src/core/renderer.svelte.ts";
import * as path from 'path';

// Create reactive state with Svelte runes
let currentThemeName = $state("Terminal");
let message = $state("Welcome to SveltUI Themes!");

// Get all available themes
const availableThemes = getAvailableThemes();
const themeFiles = getThemeFiles();

// Combine built-in themes and file-based themes
const allThemes = [
  'Terminal', 'Dark', 'Light',
  ...themeFiles.builtIn.map(file => path.basename(file, path.extname(file))),
  ...themeFiles.custom.map(file => path.basename(file, path.extname(file)))
];

// Initialize the terminal screen
const screen = initializeScreen({
  title: "SveltUI Theme Demo",
});

// Create a main container
const main = render("box", {
  width: "100%",
  height: "100%",
  border: true,
});

// Create a header with reference for updating
const headerElement = render("text", {
  parent: main.element,
  top: 1,
  left: "center",
  content: "SveltUI Theme Demonstration",
  style: {
    bold: true,
  },
});

// Create a box to show current theme
const themeBox = render("box", {
  parent: main.element,
  top: 3,
  left: "center",
  width: "80%",
  height: 3,
  border: true,
  content: `Current Theme: ${currentThemeName}`,
});

// Create a surface/panel to demonstrate surface colors
const surfaceBox = render("box", {
  parent: main.element,
  top: 7,
  left: "center",
  width: "70%",
  height: 6,
  border: true,
  type: "panel", // This will use the surface color
  label: " Panel Example ",
});

// Add some text to the panel
render("text", {
  parent: surfaceBox.element,
  top: 1,
  left: "center",
  content: "This panel uses the surface color",
});

render("text", {
  parent: surfaceBox.element,
  top: 2,
  left: "center",
  content: "Different from the main background",
  muted: true, // This will use the muted text color
});

// Create a status display to show various colors
const statusBox = render("box", {
  parent: main.element,
  top: 14,
  left: "center",
  width: "80%",
  height: 6,
  border: true,
  label: " Status Colors ",
});

// Add status texts with different colors
render("text", {
  parent: statusBox.element,
  top: 0,
  left: 2,
  content: "Success Message",
  style: { fg: "green" }, // This will use the success color
});

render("text", {
  parent: statusBox.element,
  top: 1,
  left: 2,
  content: "Warning Message",
  style: { fg: "yellow" }, // This will use the warning color
});

render("text", {
  parent: statusBox.element,
  top: 2,
  left: 2,
  content: "Error Message",
  style: { fg: "red" }, // This will use the error color
});

render("text", {
  parent: statusBox.element,
  top: 3,
  left: 2,
  content: "Info Message",
  style: { fg: "blue" }, // This will use the info color
});

// Create two lists:
// 1. An instant preview list that changes theme on navigation
// 2. A deliberate selection list that only changes theme on Enter

// Function to apply a theme by name
function applyTheme(themeName: string) {
  try {
    // Update current theme name
    currentThemeName = themeName;
    console.log(`Applying theme: ${themeName}`);
    
    // Apply the theme based on its name
    let theme;
    
    switch (themeName) {
      case 'Terminal':
        theme = TerminalTheme;
        break;
      case 'Dark':
        theme = DarkTheme;
        break;
      case 'Light':
        theme = LightTheme;
        break;
      default:
        // Try to load from built-in themes
        const builtInFile = themeFiles.builtIn.find(file => 
          path.basename(file, path.extname(file)).toLowerCase() === themeName.toLowerCase()
        );
        
        if (builtInFile) {
          theme = loadTheme(builtInFile);
          if (theme) {
            console.log(`Loaded built-in theme from: ${builtInFile}`);
            break;
          }
        }
        
        // Try to load from custom themes
        const customFile = themeFiles.custom.find(file => 
          path.basename(file, path.extname(file)).toLowerCase() === themeName.toLowerCase()
        );
        
        if (customFile) {
          theme = loadTheme(customFile);
          if (theme) {
            console.log(`Loaded custom theme from: ${customFile}`);
            break;
          }
        }
        
        // Fallback to a custom theme if not found
        console.log(`Creating fallback theme for: ${themeName}`);
        theme = createTheme(themeName, {
          primary: "#9966ff",
          background: "#1a1a2e",
          foreground: "#e6e6ff"
        });
        break;
    }
    
    // Make sure we have a valid theme
    if (!theme) {
      console.error(`No valid theme found for: ${themeName}`);
      return;
    }
    
    // Apply the theme
    console.log(`Setting theme:`, theme.name);
    setTheme(theme);
    
    // Update the theme display
    themeBox.update({ content: `Current Theme: ${currentThemeName}` });
    
    // Force a complete re-render
    screen.render();
  } catch (error) {
    console.error("Error applying theme:", error);
  }
}

// 1. Instant Preview List (with event handler)
const previewListElement = render("list", {
  parent: main.element,
  top: 21,
  left: "10%",
  width: "38%",
  height: 8,
  items: allThemes,
  border: true,
  label: " Preview as you navigate ",
  tags: true,  // Enable tags for styling
  keys: true,
  vi: true,
  mouse: true,
  interactive: true,
  style: {
    // Fixed colors that don't rely on theme
    fg: "white",
    bg: "black",
    border: {
      fg: "green"
    },
    item: {
      fg: "white"
    },
    selected: {
      bg: "blue",
      fg: "white",
      bold: true
    }
  }
});

// Manually handle key presses for the preview list
previewListElement.element.key(['up', 'down'], () => {
  // Get the currently highlighted index after the key press
  setTimeout(() => {
    const index = (previewListElement.element as any).selected;
    if (index !== undefined && index >= 0 && index < allThemes.length) {
      applyTheme(allThemes[index]);
    }
  }, 0);
});

// 2. Deliberate Selection List (apply on Enter only)
const selectListElement = render("list", {
  parent: main.element,
  top: 21,
  right: "10%",
  width: "38%",
  height: 8,
  items: allThemes,
  border: true,
  label: " Select with Enter ",
  tags: true,  // Enable tags for styling
  keys: true,
  vi: true,
  mouse: true,
  interactive: true,
  style: {
    // Fixed colors that don't rely on theme
    fg: "white",
    bg: "black",
    border: {
      fg: "cyan",
    },
    item: {
      fg: "white",
    },
    selected: {
      bg: "blue",
      fg: "white",
      bold: true
    }
  }
});

// Handle selection when Enter is pressed
selectListElement.element.key('enter', () => {
  const index = (selectListElement.element as any).selected;
  if (index !== undefined && index >= 0 && index < allThemes.length) {
    applyTheme(allThemes[index]);
  }
});

// Add some instructions
const helpText = render("text", {
  parent: main.element,
  bottom: 2,
  left: "center",
  content: "Left: preview as you navigate | Right: press Enter to apply | Tab: switch focus | Esc/Q: exit",
  style: {
    fg: "gray",
  },
});

// Add key to switch focus between lists
screen.key('tab', function() {
  // Toggle focus between the two lists
  if (screen.focused === previewListElement.element) {
    selectListElement.element.focus();
  } else {
    previewListElement.element.focus();
  }
  screen.render();
});

// Register exit keys
screen.key(['q', 'C-c', 'escape'], function() {
  process.exit(0);
});

// Set initial focus on the preview list
previewListElement.element.focus();

// Apply initial theme (Terminal theme)
applyTheme('Terminal');

// Render the screen
screen.render();