/**
 * Simple Keyboard Handling Demo for SveltUI
 * 
 * This example demonstrates the recommended keyboard handling patterns
 * using SveltUI's key handling utilities.
 */

import { 
  initializeScreen, 
  render,
  setupTabNavigation,
  setupExitKeys,
  setupInputHandling,
  focusFirst,
  safeToString,
  getTheme
} from "../src/core/renderer.svelte.ts";

// Create reactive state with Svelte 5 runes
let focusInfo = $state("Press Tab to navigate between elements");
let inputValue = $state("");
let selectedIndex = $state(0);
let isChecked = $state(false);
let counter = $state(0);

// Initialize the screen
const screen = initializeScreen({
  title: "SveltUI Keyboard Demo",
});

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
render("text", {
  parent: main.element,
  top: 1,
  left: "center",
  content: "SveltUI Simple Keyboard Handling Demo",
  style: { 
    bold: true,
    fg: getTheme().colors.primary
  }
});

// Status display showing focus and key information
const statusElement = render("text", {
  parent: main.element,
  top: 3,
  left: "center",
  content: focusInfo,
  style: {
    fg: "white"
  }
});

// Instructions
render("text", {
  parent: main.element,
  top: 5,
  left: "center",
  content: "Tab/Shift+Tab: Navigate | Space/Enter: Activate | +/-: Increment/Decrement Counter | q: Quit",
  style: { fg: getTheme().colors.secondary }
});

// Counter display
const counterElement = render("text", {
  parent: main.element,
  top: 7,
  left: "center",
  content: `Counter: ${counter}`,
  style: {
    fg: getTheme().colors.primary,
    bold: true
  }
});

// Create a list with standard tab behavior
const listElement = render("list", {
  parent: main.element,
  top: 9,
  left: 5,
  width: "40%",
  height: 6,
  items: ["Item 1", "Item 2", "Item 3", "Item 4"],
  selected: selectedIndex,
  border: true,
  label: " List ",
  onSelect: (index, item) => {
    selectedIndex = index;
    focusInfo = `Selected list item: ${safeToString(item)} (index: ${index})`;
    statusElement.update({ content: focusInfo });
  },
  onFocus: () => {
    focusInfo = "List focused - Use arrow keys to navigate, Enter to select";
    statusElement.update({ content: focusInfo });
  }
});

// Add custom Enter handler for list selection
listElement.element.key('enter', () => {
  const index = listElement.element.selected;
  const item = listElement.element.items[index];
  
  selectedIndex = index;
  focusInfo = `Selected list item: ${safeToString(item)} (index: ${index})`;
  statusElement.update({ content: focusInfo });
  screen.render();
});

// Create a text input with standard tab behavior
const inputElement = render("input", {
  parent: main.element,
  top: 9,
  right: 5,
  width: "40%",
  height: 3,
  border: true,
  label: " Input ",
  value: inputValue,
  onChange: (value) => {
    inputValue = value;
  },
  onFocus: () => {
    focusInfo = "Input focused - Type and press Enter to submit, Escape to exit";
    statusElement.update({ content: focusInfo });
  }
});

// Create a checkbox
const checkboxElement = render("checkbox", {
  parent: main.element,
  top: 17,
  left: 5,
  checked: isChecked,
  label: "Check me",
  onChange: (checked) => {
    isChecked = checked;
    focusInfo = `Checkbox ${checked ? "checked" : "unchecked"}`;
    statusElement.update({ content: focusInfo });
  },
  onFocus: () => {
    focusInfo = "Checkbox focused - Press Space or Enter to toggle";
    statusElement.update({ content: focusInfo });
  }
});

// Create a button
const buttonElement = render("box", {
  parent: main.element,
  top: 17,
  right: 5,
  width: 30,
  height: 3,
  content: "Reset Counter",
  align: "center",
  valign: "middle",
  border: true,
  style: {
    focus: {
      border: {
        fg: getTheme().colors.primary
      },
      fg: "white",
      bg: getTheme().colors.primary
    },
    hover: {
      bg: getTheme().colors.secondary,
      fg: "white"
    }
  },
  onClick: () => {
    counter = 0;
    counterElement.update({ content: `Counter: ${counter}` });
    focusInfo = "Counter reset to 0";
    statusElement.update({ content: focusInfo });
  },
  onFocus: () => {
    focusInfo = "Button focused - Press Enter or Space to activate";
    statusElement.update({ content: focusInfo });
  }
});

// Add key handlers for the button
buttonElement.element.key(['space', 'enter'], () => {
  counter = 0;
  counterElement.update({ content: `Counter: ${counter}` });
  focusInfo = "Counter reset to 0";
  statusElement.update({ content: focusInfo });
  screen.render();
});

// Debug box showing last key pressed
const keyInfoElement = render("box", {
  parent: main.element,
  bottom: 3,
  left: "center",
  width: "80%",
  height: 3,
  border: true,
  label: " Last Key Press ",
  content: "Press any key to see details here",
  align: "center",
  valign: "middle",
  style: {
    border: {
      fg: "yellow"
    }
  }
});

// Add exit instructions
render("text", {
  parent: main.element,
  bottom: 1,
  left: "center",
  content: "Press q to exit",
  style: { fg: getTheme().colors.secondary }
});

// ============================================================================
// Set up keyboard handling using SveltUI utilities
// ============================================================================

// Set up tab navigation between elements
const focusableElements = [
  listElement.element,
  inputElement.element,
  checkboxElement.element,
  buttonElement.element
];
setupTabNavigation(screen, focusableElements);

// Set up exit keys (q and Ctrl+C)
setupExitKeys(screen);

// Set up input handling with proper escape behavior
setupInputHandling(inputElement.element, {
  onEscape: () => {
    // Move to checkbox on escape
    checkboxElement.element.focus();
    
    focusInfo = "Checkbox focused - Press Space or Enter to toggle";
    statusElement.update({ content: focusInfo });
    screen.render();
  },
  onSubmit: (value) => {
    inputValue = value;
    focusInfo = `Input submitted: ${value}`;
    statusElement.update({ content: focusInfo });
    
    // Clear input after submission
    inputElement.update({ value: "" });
    
    // Move to checkbox
    checkboxElement.element.focus();
    
    focusInfo = "Checkbox focused - Press Space or Enter to toggle";
    statusElement.update({ content: focusInfo });
    screen.render();
  }
});

// Counter increment/decrement
screen.key('+', () => {
  // Skip when input is focused
  if (screen.focused === inputElement.element) return;
  
  counter++;
  counterElement.update({ content: `Counter: ${counter}` });
  screen.render();
});

screen.key('-', () => {
  // Skip when input is focused
  if (screen.focused === inputElement.element) return;
  
  counter--;
  counterElement.update({ content: `Counter: ${counter}` });
  screen.render();
});

// Update key info on any key press
screen.on("keypress", (ch, key) => {
  if (!key) return;
  
  const modifiers = [];
  if (key.ctrl) modifiers.push("Ctrl");
  if (key.shift) modifiers.push("Shift");
  if (key.meta) modifiers.push("Meta");
  if (key.alt) modifiers.push("Alt");
  
  const modifierText = modifiers.length > 0 ? ` (${modifiers.join("+")})` : "";
  const keyName = key.name || ch;
  const focusedElement = screen.focused ? screen.focused.type : "none";
  
  keyInfoElement.update({
    content: `Key: ${keyName}${modifierText}\nFocused element: ${focusedElement}`
  });
});

// Set initial focus to the list
focusFirst(focusableElements);

// Render the screen
screen.render();