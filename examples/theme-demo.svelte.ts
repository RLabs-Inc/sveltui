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

// Create a list of themes to select from
const listElement = render("list", {
  parent: main.element,
  top: 21,
  left: "center",
  width: "50%",
  height: 8,
  items: allThemes,
  border: true,
  label: " Select Theme ",
  onSelect: (item: any, index: number) => {
    const themeName = item.toString();
    currentThemeName = themeName;
    
    // Update the theme based on selection
    switch (themeName) {
      case 'Terminal':
        setTheme(TerminalTheme);
        break;
      case 'Dark':
        setTheme(DarkTheme);
        break;
      case 'Light':
        setTheme(LightTheme);
        break;
      default:
        // Try to load from theme files
        const builtInFile = themeFiles.builtIn.find(file => 
          path.basename(file, path.extname(file)).toLowerCase() === themeName.toLowerCase()
        );
        
        if (builtInFile) {
          const theme = loadTheme(builtInFile);
          if (theme) {
            setTheme(theme);
            break;
          }
        }
        
        const customFile = themeFiles.custom.find(file => 
          path.basename(file, path.extname(file)).toLowerCase() === themeName.toLowerCase()
        );
        
        if (customFile) {
          const theme = loadTheme(customFile);
          if (theme) {
            setTheme(theme);
            break;
          }
        }
        
        // Fallback to a custom theme if not found
        const customTheme = createTheme(themeName, {
          primary: "#9966ff",
          background: "#1a1a2e",
          foreground: "#e6e6ff"
        });
        setTheme(customTheme);
        break;
    }
    
    // Update the theme display
    themeBox.update({ content: `Current Theme: ${currentThemeName}` });
    
    // Force a complete re-render
    screen.render();
  },
});

// Add some instructions
const helpText = render("text", {
  parent: main.element,
  bottom: 2,
  left: "center",
  content: "Use arrow keys to select a theme, Enter to apply",
  style: {
    fg: "gray",
  },
});

// Register exit keys
screen.key(['q', 'C-c'], function() {
  process.exit(0);
});

// Set initial focus on the list
listElement.element.focus();

// Render the screen
screen.render();