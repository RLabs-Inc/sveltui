import { 
  initializeScreen,
  render, 
  setTheme, 
  getTheme,
  TerminalTheme
} from "../src/core/renderer.svelte.ts";

// Create reactive state with Svelte 5 runes
let todos = $state({
  readDocs: false,
  writeCode: false,
  testCode: false,
  fixBugs: true,
  deployCode: false
});

let settings = $state({
  notifications: true,
  darkMode: true,
  autoSave: true,
  analytics: false,
  highContrast: false
});

// Track if all todos are completed (will use indeterminate state)
let allTodosCompleted = $derived(() => {
  const todoValues = Object.values(todos);
  const completed = todoValues.filter(Boolean).length;
  return completed === todoValues.length ? true :
         completed === 0 ? false : null; // null will show indeterminate
});

// Initialize the screen
const screen = initializeScreen({
  title: "SveltUI Checkbox Component Demo",
});

// Apply terminal theme
setTheme(TerminalTheme);

// Create a main container box
const main = render("box", {
  width: "100%",
  height: "100%",
  border: true,
  style: {
    border: {
      fg: getTheme().colors.primary
    }
  }
});

// Create a header
const header = render("text", {
  parent: main.element,
  top: 1,
  left: "center",
  content: "SveltUI Checkbox Component Demo",
  style: { 
    bold: true,
    fg: getTheme().colors.primary
  }
});

// Instructions
render("text", {
  parent: main.element,
  top: 3,
  left: "center",
  content: "Navigate with Tab/Shift+Tab | Toggle with Space or Enter",
  style: { 
    fg: getTheme().colors.secondary
  }
});

// First section - Todo List
render("text", {
  parent: main.element,
  top: 5,
  left: "center",
  content: "— Todo List —",
  style: { 
    bold: true,
    fg: getTheme().colors.primary
  }
});

// "Select All" checkbox with indeterminate state
const allTodos = render("checkbox", {
  parent: main.element,
  top: 7,
  left: "center",
  checked: allTodosCompleted === true,
  indeterminate: allTodosCompleted === null,
  label: "All Todo Items",
  style: {
    bold: true,
    fg: getTheme().colors.primary
  },
  onChange: (checked) => {
    // Mark all todos with the same state
    for (const key in todos) {
      todos[key] = checked;
    }
    screen.render();
  }
});

// Individual todo checkboxes
const todoElements = [];
let row = 9;

for (const [key, value] of Object.entries(todos)) {
  const formatted = key
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
    
  const checkbox = render("checkbox", {
    parent: main.element,
    top: row,
    left: "center",
    checked: value,
    label: formatted,
    onChange: (checked) => {
      todos[key] = checked;
      screen.render();
    }
  });
  
  todoElements.push(checkbox.element);
  row += 2;
}

// Second section - Settings
render("text", {
  parent: main.element,
  top: row + 1,
  left: "center",
  content: "— Settings —",
  style: { 
    bold: true,
    fg: getTheme().colors.primary
  }
});

// Settings checkboxes
const settingsElements = [];
row += 3;

for (const [key, value] of Object.entries(settings)) {
  const formatted = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
    
  const checkbox = render("checkbox", {
    parent: main.element,
    top: row,
    left: "center",
    checked: value,
    label: formatted,
    onChange: (checked) => {
      settings[key] = checked;
      
      // Special case for dark mode
      if (key === 'darkMode') {
        // Would toggle theme if we had a light theme setup
      }
      
      screen.render();
    }
  });
  
  settingsElements.push(checkbox.element);
  row += 2;
}

// Add a disabled checkbox example
render("checkbox", {
  parent: main.element,
  top: row,
  left: "center",
  checked: true,
  disabled: true,
  label: "Premium Feature (Disabled)",
});

// Exit instructions
render("text", {
  parent: main.element,
  bottom: 2,
  left: "center",
  content: "Press q to exit",
  style: { 
    fg: getTheme().colors.secondary 
  }
});

// Set up key bindings
screen.key(['q', 'C-c'], () => process.exit(0));

// Set up tab navigation as global screen handlers
let focusIndex = $state(0);
const focusElements = [
  allTodos.element,
  ...todoElements,
  ...settingsElements
];

// Function to update focus based on current index
function updateFocus() {
  // Make sure index is in bounds
  if (focusIndex < 0) focusIndex = focusElements.length - 1;
  if (focusIndex >= focusElements.length) focusIndex = 0;
  
  // Focus the current element
  focusElements[focusIndex].focus();
  screen.render();
}

// Handle tab key for forward navigation
screen.key(['tab'], () => {
  focusIndex++;
  updateFocus();
  return false; // Allow event to continue
});

// Handle shift+tab for backward navigation
screen.key(['S-tab'], () => {
  focusIndex--;
  updateFocus();
  return false; // Allow event to continue
});

// Handle specific keys globally 
screen.key(['space', 'enter', 'return'], (ch, key) => {
  // Let the focused element handle these keys
  return false;
});

// Set initial focus
focusElements[0].focus();

// Render the screen
screen.render();