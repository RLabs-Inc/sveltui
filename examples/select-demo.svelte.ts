import { 
  initializeScreen,
  render, 
  setTheme, 
  getTheme,
  TerminalTheme
} from "../src/core/renderer.svelte.ts";

// Create reactive state with Svelte 5 runes
let selectedFruit = $state("");
let selectedColor = $state("");
let selectedPlanet = $state("");

// Initialize the screen
const screen = initializeScreen({
  title: "SveltUI Select Component Demo",
});

// Apply the terminal theme
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
  content: "SveltUI Select Component Demo",
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
  content: "Navigate with Tab/Shift+Tab | Open/close with Enter | Select with arrows + Enter",
  style: { 
    fg: getTheme().colors.secondary
  }
});

// Create a Select component for fruits
const fruitSelect = render("select", {
  parent: main.element,
  top: 6,
  left: "center",
  width: "50%",
  label: " Fruits ",
  options: [
    "Apple",
    "Banana",
    "Cherry",
    "Date",
    "Elderberry",
    "Fig",
    "Grape",
    "Honeydew"
  ],
  value: selectedFruit,
  placeholder: "Choose a fruit...",
  onChange: (value) => {
    selectedFruit = value;
    // Update the info text
    fruitInfo.update({ content: `Selected fruit: ${selectedFruit || "None"}` });
    screen.render();
  },
  handleKeyNavigation: (key) => {
    // This function gets passed down to the component
    // so it can handle the key events internally
    return true; // handled by component
  },
  handleFocus: () => {
    fruitInfo.update({ style: { fg: getTheme().colors.primary } });
    screen.render();
  },
  handleBlur: () => {
    fruitInfo.update({ style: { fg: getTheme().colors.foreground } });
    screen.render();
  }
});

// Info text for fruits
const fruitInfo = render("text", {
  parent: main.element,
  top: 10,
  left: "center",
  content: `Selected fruit: ${selectedFruit || "None"}`,
});

// Create another Select component for colors with object options
const colorSelect = render("select", {
  parent: main.element,
  top: 12,
  left: "center",
  width: "50%",
  label: " Colors ",
  options: [
    { label: "🔴 Red", value: "red" },
    { label: "🟠 Orange", value: "orange" },
    { label: "🟡 Yellow", value: "yellow" },
    { label: "🟢 Green", value: "green" },
    { label: "🔵 Blue", value: "blue" },
    { label: "🟣 Purple", value: "purple" }
  ],
  value: selectedColor,
  placeholder: "Choose a color...",
  onChange: (value) => {
    selectedColor = value;
    // Update the style and info text
    colorInfo.update({ 
      content: `Selected color: ${selectedColor || "None"}`,
      style: { 
        fg: selectedColor || getTheme().colors.foreground
      }
    });
    screen.render();
  },
  handleKeyNavigation: (key) => {
    return true; // handled by component
  },
  handleFocus: () => {
    colorInfo.update({ style: { bold: true, fg: selectedColor || getTheme().colors.primary } });
    screen.render();
  },
  handleBlur: () => {
    colorInfo.update({ style: { bold: false, fg: selectedColor || getTheme().colors.foreground } });
    screen.render();
  }
});

// Info text for colors
const colorInfo = render("text", {
  parent: main.element,
  top: 16,
  left: "center",
  content: `Selected color: ${selectedColor || "None"}`,
});

// Create a third Select component for planets
const planetSelect = render("select", {
  parent: main.element,
  top: 18,
  left: "center",
  width: "50%",
  label: " Planets ",
  options: [
    { label: "Mercury", value: "mercury" },
    { label: "Venus", value: "venus" },
    { label: "Earth", value: "earth" },
    { label: "Mars", value: "mars" },
    { label: "Jupiter", value: "jupiter" },
    { label: "Saturn", value: "saturn" },
    { label: "Uranus", value: "uranus" },
    { label: "Neptune", value: "neptune" }
  ],
  value: selectedPlanet,
  placeholder: "Choose a planet...",
  onChange: (value) => {
    selectedPlanet = value;
    planetInfo.update({ content: `Selected planet: ${selectedPlanet || "None"}` });
    screen.render();
  },
  handleKeyNavigation: (key) => {
    return true; // handled by component
  }
});

// Info text for planets
const planetInfo = render("text", {
  parent: main.element,
  top: 22,
  left: "center",
  content: `Selected planet: ${selectedPlanet || "None"}`,
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
// NOTE: This is a common pattern for terminal UIs - you need to explicitly 
// manage focus order at the application level
let focusIndex = $state(0);
const focusElements = [fruitSelect.element, colorSelect.element, planetSelect.element];

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
fruitSelect.element.focus();

// Render the screen
screen.render();