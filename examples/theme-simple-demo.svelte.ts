import { 
  initializeScreen,
  render, 
  setTheme, 
  loadTheme,
  getAvailableThemes,
  getThemeFiles,
  DarkTheme,
  LightTheme,
  TerminalTheme
} from "../src/core/renderer.svelte.ts";
import * as path from 'path';

// Create reactive state
let currentThemeName = $state("Terminal");

// Get available themes
const themeFiles = getThemeFiles();
const themeNames = [
  'Terminal', 
  'Dark', 
  'Light',
  ...themeFiles.builtIn.map(file => path.basename(file, path.extname(file))),
  ...themeFiles.custom.map(file => path.basename(file, path.extname(file)))
];

// Initialize the screen
const screen = initializeScreen({
  title: "SveltUI Simple Theme Demo",
});

// Create a main container
const main = render("box", {
  width: "100%",
  height: "100%",
  border: true,
  style: { 
    border: { fg: "blue" } 
  }
});

// Create a header
const header = render("text", {
  parent: main.element,
  top: 1,
  left: "center",
  content: "SveltUI Theme Selector",
  style: { bold: true }
});

// Display current theme
const themeInfo = render("text", {
  parent: main.element,
  top: 3,
  left: "center",
  content: `Current Theme: ${currentThemeName}`,
});

// Theme list with fixed colors
const themeList = render("list", {
  parent: main.element,
  top: 5,
  left: "center",
  width: "70%",
  height: 15,
  items: themeNames,
  border: true,
  label: " Available Themes ",
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  style: {
    fg: "white",
    bg: "black",
    border: {
      fg: "blue",
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

// Handle Enter key on the list
themeList.element.key('enter', () => {
  const index = (themeList.element as any).selected;
  if (index === undefined || index < 0 || index >= themeNames.length) return;
  
  const themeName = themeNames[index];
  applyTheme(themeName);
});

// Function to apply a theme
function applyTheme(themeName: string) {
  try {
    currentThemeName = themeName;
    console.log(`Applying theme: ${themeName}`);
    
    let theme;
    
    // Get the theme based on its name
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
          if (theme) break;
        }
        
        // Try to load from custom themes
        const customFile = themeFiles.custom.find(file => 
          path.basename(file, path.extname(file)).toLowerCase() === themeName.toLowerCase()
        );
        
        if (customFile) {
          theme = loadTheme(customFile);
          if (theme) break;
        }
        
        // If still no theme, create a default one
        if (!theme) {
          theme = {
            name: themeName,
            description: `Fallback theme for ${themeName}`,
            author: "System",
            version: "1.0.0",
            colors: {
              primary: "blue",
              secondary: "cyan",
              background: null,
              foreground: null,
              success: "green",
              warning: "yellow",
              error: "red",
              info: "cyan"
            }
          };
        }
    }
    
    // Update theme display
    themeInfo.update({ content: `Current Theme: ${themeName}` });
    
    // Apply the theme if it exists
    if (theme) {
      setTheme(theme);
      console.log("Theme applied:", theme.name);
    } else {
      console.error("No theme found for:", themeName);
    }
    
    // Render the screen with the new theme
    screen.render();
  } catch (error) {
    console.error("Error applying theme:", error);
  }
}

// Instructions
const helpText = render("text", {
  parent: main.element,
  bottom: 2,
  left: "center",
  content: "Navigate with arrows | Select with Enter | Press 'q' to exit",
  style: { fg: "gray" }
});

// Exit key
screen.key(['q', 'C-c', 'escape'], () => process.exit(0));

// Set initial focus
themeList.element.focus();

// Apply initial theme
applyTheme('Terminal');

// Render everything
screen.render();