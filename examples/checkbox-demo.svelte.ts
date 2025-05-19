// checkbox-demo.svelte.ts
//
// This example demonstrates proper keyboard handling for Checkbox components
// as documented in docs/KEY_HANDLING.md

import * as blessed from 'blessed';
import { initializeScreen, render, setTheme, DarkTheme } from '../src';

// Set the theme
setTheme(DarkTheme);

// Checkbox state
let option1 = $state(false);
let option2 = $state(true);
let option3 = $state(false);
let statusText = $state("Use [Tab] to navigate, [Space/Enter] to toggle checkboxes");

// Initialize the screen
const screen = initializeScreen({
  title: "SveltUI Checkbox Demo",
  smartCSR: true,
  fullUnicode: true,
  dockBorders: true
});

// Create main container
const main = render("box", {
  parent: screen,
  width: "100%",
  height: "100%",
  tags: true,
  border: {
    type: "line",
    fg: "blue"
  }
});

// Header
render("text", {
  parent: main.element,
  top: 1,
  left: "center",
  content: "{bold}Checkbox Demo - Keyboard Handling{/bold}",
  tags: true
});

// Instructions
render("text", {
  parent: main.element,
  top: 3,
  left: "center",
  content: "This demo shows proper keyboard handling for checkbox components.",
  tags: true
});

// Form container
const form = render("box", {
  parent: main.element,
  top: 5,
  left: "center",
  width: "80%",
  height: 12,
  tags: true,
  border: {
    type: "line"
  },
  label: " Settings "
});

// Checkbox 1
const checkbox1 = render("checkbox", {
  parent: form.element,
  top: 1,
  left: 2,
  width: "95%",
  height: 1,
  content: "",
  checked: option1,
  label: " Enable notifications "
});

// Checkbox 2
const checkbox2 = render("checkbox", {
  parent: form.element,
  top: 3,
  left: 2,
  width: "95%",
  height: 1,
  content: "",
  checked: option2,
  label: " Auto-update on startup "
});

// Checkbox 3
const checkbox3 = render("checkbox", {
  parent: form.element,
  top: 5,
  left: 2,
  width: "95%",
  height: 1,
  content: "",
  checked: option3,
  label: " Send anonymous usage data "
});

// Submit button
const submitButton = render("box", {
  parent: form.element,
  bottom: 1,
  right: 2,
  width: 12,
  height: 1,
  content: "Save",
  tags: true,
  align: "center",
  valign: "middle",
  style: {
    bg: "blue",
    fg: "white",
    focus: {
      bg: "cyan",
      fg: "black"
    },
    hover: {
      bg: "cyan",
      fg: "black"
    }
  }
});

// Status bar
const statusBar = render("box", {
  parent: main.element,
  bottom: 0,
  left: 0,
  width: "100%",
  height: 1,
  tags: true,
  style: {
    bg: "blue",
    fg: "white"
  }
});

const statusElement = render("text", {
  parent: statusBar.element,
  left: 1,
  content: statusText,
  tags: true
});

// === KEY HANDLING FOR EXTERNAL-HANDLING COMPONENTS ===

// Handle checkbox toggling with Enter or Space
screen.key(['enter', 'space'], () => {
  // Check which element is focused
  if (screen.focused === checkbox1.element) {
    // Toggle checkbox state
    option1 = !option1;
    checkbox1.update({ checked: option1 });
    statusText = `Notifications ${option1 ? "enabled" : "disabled"}`;
    statusElement.update({ content: statusText });
    screen.render();
  } 
  else if (screen.focused === checkbox2.element) {
    option2 = !option2;
    checkbox2.update({ checked: option2 });
    statusText = `Auto-update ${option2 ? "enabled" : "disabled"}`;
    statusElement.update({ content: statusText });
    screen.render();
  }
  else if (screen.focused === checkbox3.element) {
    option3 = !option3;
    checkbox3.update({ checked: option3 });
    statusText = `Usage data sharing ${option3 ? "enabled" : "disabled"}`;
    statusElement.update({ content: statusText });
    screen.render();
  }
  else if (screen.focused === submitButton.element) {
    // Handle "Submit" button click
    statusText = "Settings saved!";
    statusElement.update({ content: statusText });
    screen.render();
  }
});

// Global exit handler
screen.key(['q', 'C-c'], () => {
  return process.exit(0);
});

// Helper text at the bottom
render("text", {
  parent: main.element,
  bottom: 2,
  left: "center",
  content: "Press [q] to quit",
  tags: true
});

// Set initial focus
checkbox1.element.focus();

// Initial render
screen.render();