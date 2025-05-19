import { initializeScreen, render } from "../src/core/renderer.svelte.ts";

// Create reactive state with Svelte runes
let count = $state(0);
let message = $state("Welcome to SveltUI!");
let selectedIndex = $state(0);
let items = $state(["Dashboard", "Settings", "Profile", "Help"]);
let inputValue = $state("");

// Create derived values
let borderColor = $derived(count > 5 ? "red" : "blue");
let headerText = $derived(`SveltUI Demo - Count: ${count}`);

// Initialize the terminal screen
const screen = initializeScreen({
  title: "SveltUI Demo",
});

// We'll add keyboard event handlers after creating all elements

// Create a main container
const main = render("box", {
  width: "100%",
  height: "100%",
  border: true,
  style: {
    border: {
      fg: borderColor,
    },
  },
});

// Create a header with reference for updating
const headerElement = render("text", {
  parent: main.element,
  top: 1,
  left: "center",
  content: headerText,
  style: {
    bold: true,
  },
});

// Create a list with reference for updating
const listElement = render("list", {
  parent: main.element,
  top: 4,
  left: "center",
  width: "50%",
  height: 8,
  items: items,
  selected: selectedIndex,
  border: true,
  mouse: true,
  keys: true,
  // Minimal configuration to let blessed handle interactions
  style: {
    selected: {       // Style for selected item
      bg: 'blue',
      fg: 'white',
    },
    item: {
      hover: {        // Style for hover
        bg: 'gray',
      }
    }
  }
  // Moved onSelect handler to the element's 'select' event
});

// Create an input field with reference for updating - fix double strokes
const inputElement = render("input", {
  parent: main.element,
  top: 13,
  left: "center",
  width: "60%",
  height: 3,
  value: inputValue,
  border: true,
  inputOnFocus: true,
  keys: true,
  mouse: true,
  onSubmit: (value: string) => {
    inputValue = value;
    message = `You entered: ${inputValue}`;
    statusElement.update({ content: message });
    // Clear the input
    inputElement.update({ value: "" }); 
    // Return focus to list after submission
    listElement.element.focus();
    screen.render();
  },
});

// Create a status bar with reference for updating
const statusElement = render("text", {
  parent: main.element,
  bottom: 1,
  left: "center",
  content: message,
});

// Enter key will use the list's built-in select handler

// Tab key is handled in the global keypress handler now

// Help user understand how to navigate
const helpText = render("text", {
  parent: main.element,
  bottom: 3,
  left: "center",
  content: "Press [Tab] to focus input, [Esc] to exit input mode",
  style: {
    fg: "gray"
  }
});

// Simple key handlers without using component-specific key handlers
// Use global keys for everything to avoid conflicts

// Exit key handler
screen.key(['q', 'C-c'], function() {
  process.exit(0);
});

// Add a global keypress handler just for the counter
screen.on('keypress', function(ch, key) {
  // Skip when input is focused
  if (inputElement.element === screen.focused) return;
  
  // Handle + key for incrementing counter
  if (ch === '+') {
    count++;
    // Update derived values
    headerElement.update({ content: `SveltUI Demo - Count: ${count}` });
    main.update({ style: { border: { fg: count > 5 ? "red" : "blue" }}});
    screen.render();
  }
  // Handle - key for decrementing counter
  else if (ch === '-') {
    count--;
    // Update derived values 
    headerElement.update({ content: `SveltUI Demo - Count: ${count}` });
    main.update({ style: { border: { fg: count > 5 ? "red" : "blue" }}});
    screen.render();
  }
});

// Tab key to focus input
screen.key('tab', function() {
  inputElement.element.focus();
  screen.render();
});

// Escape key to leave input focus
screen.key('escape', function() {
  if (inputElement.element === screen.focused) {
    listElement.element.focus();
    screen.render();
  }
});

// Let blessed handle the list navigation keys natively
// This avoids duplicating the built-in arrow key functionality

// Update selectedIndex when list selection changes
listElement.element.on('select', function(item, index) {
  selectedIndex = index;
  message = `Selected: ${items[index]}`;
  statusElement.update({ content: message });
  screen.render();
});

// Set initial focus on the list for navigation
listElement.element.focus();

// Make sure we render the screen after all elements are created
screen.render();

// Handle process exit gracefully
process.on('SIGINT', () => {
  screen.destroy();
  process.exit(0);
});
