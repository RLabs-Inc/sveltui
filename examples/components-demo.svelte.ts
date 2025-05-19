// components-demo.svelte.ts
//
// This example demonstrates all SveltUI components with focus on
// proper keyboard handling techniques as documented in docs/KEY_HANDLING.md

import * as blessed from "blessed";
import {
  initializeScreen,
  render,
  setTheme,
  DarkTheme,
} from "../src/core/renderer.svelte";

// Set the theme
setTheme(DarkTheme);

// Initialize component state
let textValue = $state("Editable text");
let checkboxValue = $state(false);
let selectedItem = $state(0);
let selectValue = $state("Option 1");
let selectOpen = $state(false);
let statusText = $state("Welcome to the components demo!");

// Initialize the screen
const screen = initializeScreen({
  title: "SveltUI Components Demo",
  smartCSR: true,
  fullUnicode: true,
  dockBorders: true,
});

// Create the main container
const main = render("box", {
  parent: screen,
  width: "100%",
  height: "100%",
  tags: true,
  border: {
    type: "line",
    fg: "blue",
  },
  style: {
    border: {
      fg: "blue",
    },
  },
});

// Header with instructions
const header = render("text", {
  parent: main.element,
  top: 0,
  left: "center",
  width: "90%",
  height: 3,
  content:
    "{bold}SveltUI Components Demo{/bold}\nPress [Tab] to navigate, [Space/Enter] to interact, [?] for help, [q] to quit",
  tags: true,
  align: "center",
});

// Status panel
const statusPanel = render("box", {
  parent: main.element,
  bottom: 0,
  left: 0,
  width: "100%",
  height: 3,
  tags: true,
  border: {
    type: "line",
    fg: "gray",
  },
  style: {
    border: {
      fg: "gray",
    },
  },
});

const statusDisplay = render("text", {
  parent: statusPanel.element,
  top: 0,
  left: 1,
  width: "95%",
  content: statusText,
  tags: true,
});

// Left column - Self-Handling Components (Input & List)
const leftPanel = render("box", {
  parent: main.element,
  top: 4,
  left: 0,
  width: "50%",
  height: "60%",
  tags: true,
  label: " Self-Handling Components ",
  border: {
    type: "line",
  },
});

// Add a subheader for Input
render("text", {
  parent: leftPanel.element,
  top: 0,
  left: "center",
  width: "90%",
  height: 2,
  content: "Input Component\n(handles its own keyboard events)",
  tags: true,
  align: "center",
});

// Input component
const inputElement = render("input", {
  parent: leftPanel.element,
  top: 3,
  left: "center",
  width: "80%",
  height: 3,
  value: textValue,
  style: {
    focus: {
      border: {
        fg: "green",
      },
    },
  },
  border: {
    type: "line",
  },
  onChange: (value: string) => {
    textValue = value;
    statusText = `Input changed: "${value}"`;
    statusDisplay.update({ content: statusText });
    screen.render();
  },
  onSubmit: (value: string) => {
    statusText = `Input submitted: "${value}"`;
    statusDisplay.update({ content: statusText });
    screen.render();
  },
});

// Add a subheader for List
render("text", {
  parent: leftPanel.element,
  top: 7,
  left: "center",
  width: "90%",
  height: 2,
  content: "List Component\n(handles up/down navigation internally)",
  tags: true,
  align: "center",
});

// List component
const listItems = [
  "Item 1 - First option",
  "Item 2 - Second option",
  "Item 3 - Third option",
  "Item 4 - Fourth option",
  "Item 5 - Fifth option",
];

const listElement = render("list", {
  parent: leftPanel.element,
  top: 10,
  left: "center",
  width: "80%",
  height: 8,
  items: listItems,
  style: {
    selected: {
      bg: "blue",
      fg: "white",
    },
    focus: {
      border: {
        fg: "green",
      },
    },
  },
  border: {
    type: "line",
  },
  keys: true,
  vi: true,
  mouse: true,
  selected: selectedItem,
});

// Handle list selection
listElement.element.on("select", (item, index) => {
  selectedItem = index as unknown as number;
  statusText = `List item selected: "${item}" at index ${index}`;
  statusDisplay.update({ content: statusText });
  screen.render();
});

// Right column - External-Handling Components (Checkbox & Select)
const rightPanel = render("box", {
  parent: main.element,
  top: 4,
  right: 0,
  width: "50%",
  height: "60%",
  tags: true,
  label: " External-Handling Components ",
  border: {
    type: "line",
  },
});

// Add a subheader for Checkbox
render("text", {
  parent: rightPanel.element,
  top: 0,
  left: "center",
  width: "90%",
  height: 2,
  content: "Checkbox Component\n(use Enter/Space to toggle)",
  tags: true,
  align: "center",
});

// Checkbox component
const checkboxElement = render("checkbox", {
  parent: rightPanel.element,
  top: 3,
  left: "center",
  width: "80%",
  height: 3,
  label: " Enable feature ",
  checked: checkboxValue,
  style: {
    focus: {
      border: {
        fg: "green",
      },
    },
  },
  border: {
    type: "line",
  },
});

// Add a subheader for Select
render("text", {
  parent: rightPanel.element,
  top: 7,
  left: "center",
  width: "90%",
  height: 2,
  content:
    "Select Component\n(use Enter/Space to open/close, arrows to navigate)",
  tags: true,
  align: "center",
});

// Select component
const selectOptions = [
  "Option 1",
  "Option 2",
  "Option 3",
  "Option 4",
  "Option 5",
];

const selectElement = render("select", {
  parent: rightPanel.element,
  top: 10,
  left: "center",
  width: "80%",
  height: 3,
  options: selectOptions,
  style: {
    focus: {
      border: {
        fg: "green",
      },
    },
    selected: {
      bg: "blue",
      fg: "white",
    },
  },
  border: {
    type: "line",
  },
  value: selectValue,
  open: selectOpen,
});

// Help panel (hidden by default)
const helpPanel = render("box", {
  parent: main.element,
  top: "center",
  left: "center",
  width: "70%",
  height: "70%",
  tags: true,
  label: " Keyboard Controls ",
  hidden: true,
  border: {
    type: "line",
    fg: "yellow",
  },
  style: {
    border: {
      fg: "yellow",
    },
    bg: "black",
  },
});

// Add help content
render("text", {
  parent: helpPanel.element,
  top: 1,
  left: 2,
  width: "95%",
  height: "95%",
  tags: true,
  content: `{bold}Global Controls:{/bold}
[Tab] - Navigate between components
[Shift+Tab] - Navigate backward
[q] or [Ctrl+C] - Quit application
[?] - Toggle this help screen

{bold}Input Controls:{/bold}
Arrow keys - Move cursor
[Backspace] - Delete character
[Enter] - Submit value
[Escape] - Exit input mode

{bold}List Controls:{/bold}
[Up]/[Down] - Navigate items
[Enter] - Select item
[j]/[k] - Navigate items (vi mode)

{bold}Checkbox Controls:{/bold}
[Space] or [Enter] - Toggle checkbox

{bold}Select Controls:{/bold}
[Space] or [Enter] - Open/close dropdown
[Up]/[Down] - Navigate options when open
[Enter] - Select option when open
[Escape] - Close dropdown

{bold}Component Handling Types:{/bold}
- {underline}Self-Handling{/underline}: Input and List components handle their own key events
- {underline}External-Handling{/underline}: Checkbox and Select require application-level key handling

See {bold}docs/KEY_HANDLING.md{/bold} for more details on keyboard handling patterns.`,
});

// Close help button
const closeHelpButton = render("box", {
  parent: helpPanel.element,
  bottom: 1,
  left: "center",
  width: 20,
  height: 3,
  content: "Close Help",
  tags: true,
  align: "center",
  valign: "middle",
  border: {
    type: "line",
    fg: "yellow",
  },
  style: {
    focus: {
      bg: "yellow",
      fg: "black",
    },
    border: {
      fg: "yellow",
    },
    hover: {
      bg: "yellow",
      fg: "black",
    },
  },
});

// Set up keyboard handling for external-handling components

// Checkbox toggle
screen.key(["enter", "space"], () => {
  if (screen.focused === checkboxElement.element) {
    checkboxValue = !checkboxValue;
    checkboxElement.update({ checked: checkboxValue });
    statusText = `Checkbox toggled: ${checkboxValue ? "checked" : "unchecked"}`;
    statusDisplay.update({ content: statusText });
    screen.render();
  }
});

// Select dropdown toggle and navigation
screen.key(["enter", "space"], () => {
  if (screen.focused === selectElement.element) {
    // Toggle dropdown
    selectOpen = !selectOpen;
    selectElement.update({ open: selectOpen });

    if (selectOpen) {
      statusText = "Select dropdown opened";
    } else {
      statusText = `Selected option: "${selectValue}"`;
    }

    statusDisplay.update({ content: statusText });
    screen.render();
  } else if (screen.focused === closeHelpButton.element) {
    // Handle close help button
    helpPanel.element.toggle();

    // Restore focus to last focused element
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
    screen.render();
  }
});

// Help panel toggle
let lastFocusedElement: blessed.Widgets.BlessedElement | null = null;
screen.key("?", () => {
  const helpIsVisible = !helpPanel.element.hidden;
  if (helpIsVisible) {
    // Save currently focused element
    lastFocusedElement = screen.focused;

    helpPanel.element.toggle();

    // Restore focus
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  } else {
    closeHelpButton.element.focus();
  }
  screen.render();
});

// Global key handling for exit
screen.key(["q", "C-c"], () => {
  return process.exit(0);
});

// Select component change handler
selectElement.element.on("select", (selected) => {
  selectValue = selected;
  selectOpen = false;
  statusText = `Select value changed: "${selected}"`;
  statusDisplay.update({ content: statusText });
  screen.render();
});

// Initial focus
listElement.element.focus();

// Initial render
screen.render();
