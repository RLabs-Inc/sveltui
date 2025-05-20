# SvelTUI Usage Guide

This document provides examples and patterns for building terminal interfaces with SvelTUI.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Advanced Patterns](#advanced-patterns)
  - [Creating a Dashboard](#creating-a-dashboard)
  - [Building a Form](#building-a-form)
  - [Creating a Menu System](#creating-a-menu-system)
  - [Data Visualization](#data-visualization)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Basic Usage

Here's a simple example of a SvelTUI application:

```typescript
import { initializeScreen, render } from "sveltui";

// Create reactive state with Svelte runes
let count = $state(0);
let message = $state("Welcome to SvelTUI");

// Initialize the terminal screen
const screen = initializeScreen({
  title: "Basic Example",
});

// Create a main container
const main = render("box", {
  width: "100%",
  height: "100%",
  border: true,
  style: {
    border: { fg: "blue" },
  },
});

// Create a header
const header = render("text", {
  parent: main.element,
  top: 1,
  left: "center",
  content: "SvelTUI Example",
  style: { bold: true },
});

// Create content that shows state
const content = render("text", {
  parent: main.element,
  top: 3,
  left: "center",
  content: `Count: ${count} - ${message}`,
});

// Create a button using box
const button = render("box", {
  parent: main.element,
  top: 5,
  left: "center",
  width: 10,
  height: 3,
  content: "Increment",
  border: true,
  style: {
    focus: {
      border: { fg: "green" },
    },
  },
  onClick: () => {
    count++;
    content.update({ content: `Count: ${count} - ${message}` });
    screen.render();
  },
});

// Handle keyboard navigation and input
screen.key(["escape", "q", "C-c"], () => process.exit(0));

screen.key("+", () => {
  count++;
  content.update({ content: `Count: ${count} - ${message}` });
  screen.render();
});

// Focus the button
button.element.focus();

// Render the screen
screen.render();
```

## Advanced Patterns

### Creating a Dashboard

Here's how to create a dashboard layout with multiple panels:

```typescript
import { initializeScreen, render } from "sveltui";

// Initialize screen
const screen = initializeScreen({ title: "Dashboard" });

// Create main container
const main = render("box", {
  width: "100%",
  height: "100%",
});

// Create header
render("text", {
  parent: main.element,
  top: 0,
  left: "center",
  content: "SYSTEM DASHBOARD",
  style: { bold: true },
});

// Create panels in a grid layout
const panelOptions = { border: true, width: "45%", height: "40%" };

// Top left: CPU usage
const cpuPanel = render("box", {
  ...panelOptions,
  parent: main.element,
  top: 2,
  left: 1,
  label: " CPU Usage ",
});

render("text", {
  parent: cpuPanel.element,
  top: "center",
  left: "center",
  content: "45% Utilized",
  style: { fg: "green" },
});

// Top right: Memory usage
const memoryPanel = render("box", {
  ...panelOptions,
  parent: main.element,
  top: 2,
  right: 1,
  label: " Memory ",
});

render("text", {
  parent: memoryPanel.element,
  top: "center",
  left: "center",
  content: "3.2 GB / 8GB",
  style: { fg: "yellow" },
});

// Bottom left: Network
const networkPanel = render("box", {
  ...panelOptions,
  parent: main.element,
  bottom: 1,
  left: 1,
  label: " Network ",
});

render("text", {
  parent: networkPanel.element,
  top: "center",
  left: "center",
  content: "↓ 2.5 MB/s  ↑ 0.8 MB/s",
});

// Bottom right: Disk
const diskPanel = render("box", {
  ...panelOptions,
  parent: main.element,
  bottom: 1,
  right: 1,
  label: " Disk I/O ",
});

render("text", {
  parent: diskPanel.element,
  top: "center",
  left: "center",
  content: "Read: 15 MB/s  Write: 5 MB/s",
});

// Key handling
screen.key(["escape", "q", "C-c"], () => process.exit(0));

// Render
screen.render();
```

### Building a Form

Creating an interactive form with validation:

```typescript
import { initializeScreen, render } from "sveltui";

// Form state
let username = $state("");
let password = $state("");
let email = $state("");
let errors = $state<Record<string, string>>({});
let submitted = $state(false);

// Initialize screen
const screen = initializeScreen({ title: "Form Example" });

// Create main container
const main = render("box", {
  width: "70%",
  height: "70%",
  top: "center",
  left: "center",
  border: true,
  label: " Registration Form ",
});

// Create form elements
render("text", {
  parent: main.element,
  top: 2,
  left: 2,
  content: "Username:",
});

const usernameInput = render("input", {
  parent: main.element,
  top: 2,
  left: 15,
  width: 30,
  height: 3,
  border: true,
  value: username,
  onChange: (value) => {
    username = value;
    validate();
  },
});

render("text", {
  parent: main.element,
  top: 6,
  left: 2,
  content: "Password:",
});

const passwordInput = render("input", {
  parent: main.element,
  top: 6,
  left: 15,
  width: 30,
  height: 3,
  border: true,
  censor: true,
  value: password,
  onChange: (value) => {
    password = value;
    validate();
  },
});

render("text", {
  parent: main.element,
  top: 10,
  left: 2,
  content: "Email:",
});

const emailInput = render("input", {
  parent: main.element,
  top: 10,
  left: 15,
  width: 30,
  height: 3,
  border: true,
  value: email,
  onChange: (value) => {
    email = value;
    validate();
  },
});

// Error display
const errorDisplay = render("text", {
  parent: main.element,
  top: 14,
  left: 2,
  width: 43,
  content: "",
  style: { fg: "red" },
});

// Submit button
const submitButton = render("box", {
  parent: main.element,
  top: 16,
  left: "center",
  width: 10,
  height: 3,
  content: "Submit",
  border: true,
  style: {
    focus: {
      border: { fg: "green" },
    },
  },
  onClick: () => {
    validate();
    if (Object.keys(errors).length === 0) {
      submitted = true;
      successMessage.update({ content: "Form submitted successfully!" });
    }
    screen.render();
  },
});

// Success message
const successMessage = render("text", {
  parent: main.element,
  bottom: 2,
  left: "center",
  content: "",
  style: { fg: "green" },
});

// Validation function
function validate() {
  errors = {};

  if (!username) {
    errors.username = "Username is required";
  } else if (username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!email.includes("@")) {
    errors.email = "Email must be valid";
  }

  // Update error display
  const errorList = Object.values(errors).join("\n");
  errorDisplay.update({ content: errorList });
  screen.render();
}

// Key navigation
screen.key("tab", () => {
  const focused = screen.focused;
  if (focused === usernameInput.element) {
    passwordInput.element.focus();
  } else if (focused === passwordInput.element) {
    emailInput.element.focus();
  } else if (focused === emailInput.element) {
    submitButton.element.focus();
  } else {
    usernameInput.element.focus();
  }
  screen.render();
});

// Exit keys
screen.key(["escape", "q", "C-c"], () => process.exit(0));

// Initial focus
usernameInput.element.focus();
screen.render();
```

### Creating a Menu System

Building a menu-driven interface:

```typescript
import { initializeScreen, render } from "sveltui";

// App state
let activeMenu = $state("main"); // main, files, settings, help
let statusMessage = $state("Welcome to the application");

// Initialize screen
const screen = initializeScreen({ title: "Menu System" });

// Create layout
const layout = render("box", {
  width: "100%",
  height: "100%",
});

// Create header
render("text", {
  parent: layout.element,
  top: 0,
  left: "center",
  content: "APPLICATION MENU",
  style: { bold: true },
});

// Create menu container
const menuContainer = render("box", {
  parent: layout.element,
  top: 2,
  left: 0,
  width: 20,
  height: "100%-2",
  border: true,
});

// Create content area
const contentArea = render("box", {
  parent: layout.element,
  top: 2,
  left: 21,
  width: "100%-22",
  height: "100%-4",
  border: true,
  content: "",
});

// Create status bar
const statusBar = render("text", {
  parent: layout.element,
  bottom: 0,
  left: 0,
  width: "100%",
  height: 1,
  content: statusMessage,
  style: {
    bg: "blue",
    fg: "white",
  },
});

// Create menu items
const menuItems = ["Main Menu", "File Operations", "Settings", "Help", "Exit"];

const menuList = render("list", {
  parent: menuContainer.element,
  top: 0,
  left: 0,
  width: "100%-2",
  height: "100%-2",
  items: menuItems,
  style: {
    selected: {
      bg: "blue",
      fg: "white",
    },
  },
  keys: true,
  onSelect: (item, index) => {
    switch (index) {
      case 0:
        activeMenu = "main";
        updateContent();
        break;
      case 1:
        activeMenu = "files";
        updateContent();
        break;
      case 2:
        activeMenu = "settings";
        updateContent();
        break;
      case 3:
        activeMenu = "help";
        updateContent();
        break;
      case 4:
        process.exit(0);
        break;
    }
  },
});

// Update content based on active menu
function updateContent() {
  let content;

  switch (activeMenu) {
    case "main":
      content =
        "Main Menu\n\nWelcome to the application.\nUse the menu on the left to navigate.";
      break;
    case "files":
      content =
        "File Operations\n\n- Create new file\n- Open existing file\n- Save current file\n- Export as...";
      break;
    case "settings":
      content =
        "Settings\n\n- Application preferences\n- User profile\n- Theme: Dark\n- Language: English";
      break;
    case "help":
      content =
        "Help\n\n- Documentation\n- About\n- Check for updates\n- Report an issue";
      break;
  }

  contentArea.update({ content });
  statusMessage = `Current section: ${activeMenu}`;
  statusBar.update({ content: statusMessage });
  screen.render();
}

// Initial content
updateContent();

// Focus menu
menuList.element.focus();

// Key handling
screen.key(["escape", "q", "C-c"], () => process.exit(0));

screen.render();
```

### Data Visualization

Creating simple data visualizations:

```typescript
import { initializeScreen, render } from "sveltui";

// Sample data
const data = [
  { month: "Jan", value: 12 },
  { month: "Feb", value: 19 },
  { month: "Mar", value: 15 },
  { month: "Apr", value: 22 },
  { month: "May", value: 28 },
  { month: "Jun", value: 32 },
];

// Initialize screen
const screen = initializeScreen({ title: "Data Visualization" });

// Create main container
const main = render("box", {
  width: "100%",
  height: "100%",
  border: true,
});

// Create chart title
render("text", {
  parent: main.element,
  top: 1,
  left: "center",
  content: "Monthly Sales Data",
  style: { bold: true },
});

// Create chart container
const chartContainer = render("box", {
  parent: main.element,
  top: 3,
  left: "center",
  width: "90%",
  height: 20,
});

// Find maximum value for scaling
const maxValue = Math.max(...data.map((item) => item.value));
const chartHeight = 15;
const barWidth = 8;

// Create bars for each data point
data.forEach((item, index) => {
  const barHeight = Math.round((item.value / maxValue) * chartHeight);
  const barLeft = index * (barWidth + 2) + 2;

  // Create bar
  render("box", {
    parent: chartContainer.element,
    bottom: 2,
    left: barLeft,
    width: barWidth,
    height: barHeight,
    style: {
      bg: "blue",
    },
  });

  // Create label
  render("text", {
    parent: chartContainer.element,
    bottom: 1,
    left: barLeft + barWidth / 2 - 1,
    content: item.month,
  });

  // Create value label
  render("text", {
    parent: chartContainer.element,
    bottom: barHeight + 2,
    left: barLeft + barWidth / 2 - 1,
    content: item.value.toString(),
    style: { fg: "yellow" },
  });
});

// Create chart legend
render("text", {
  parent: main.element,
  bottom: 3,
  left: "center",
  content: "Monthly Sales (in thousands $)",
});

// Key handling
screen.key(["escape", "q", "C-c"], () => process.exit(0));

screen.render();
```

## Best Practices

### Performance Optimization

1. **Limit Redraws**: Only call `screen.render()` when necessary, not after every tiny change.

```typescript
// Bad
function updateCounter() {
  count++;
  countDisplay.update({ content: `Count: ${count}` });
  screen.render(); // Excessive rendering
}

// Good
function batchUpdates() {
  count++;
  temperature += 2;
  humidity -= 1;

  // Update multiple elements
  countDisplay.update({ content: `Count: ${count}` });
  tempDisplay.update({ content: `Temp: ${temperature}°C` });
  humidityDisplay.update({ content: `Humidity: ${humidity}%` });

  // Render once at the end
  screen.render();
}
```

2. **Throttle Input Handling**: For rapid events like keyboard input, consider throttling.

```typescript
let lastKeyTime = 0;
const throttleDelay = 100; // ms

screen.on("keypress", function (ch, key) {
  const now = Date.now();
  if (now - lastKeyTime < throttleDelay) {
    return; // Skip if too soon after last keystroke
  }
  lastKeyTime = now;

  // Handle keypress
});
```

3. **Use Efficient Selectors**: When updating elements, use direct references instead of searching.

```typescript
// Store references to frequently updated elements
const statusBar = render("text", { content: "Status" });

// Later
statusBar.update({ content: "New status" }); // Direct reference
```

### Code Organization

1. **Separate UI Logic**: Keep UI rendering logic separate from business logic.

```typescript
// UI rendering
function renderUI() {
  // Create and update UI elements
}

// Business logic
function processData(data) {
  // Process data, return results
  return processedData;
}

// Connect them
const data = processData(rawData);
updateUIWithData(data);
```

2. **Group Related Components**: Keep related UI elements together.

```typescript
function createFormField(label, value, top) {
  const container = render("box", {
    width: "100%",
    height: 5,
    top: top,
  });

  render("text", {
    parent: container.element,
    content: label,
    left: 2,
    top: 1,
  });

  const input = render("input", {
    parent: container.element,
    left: 20,
    top: 1,
    width: 30,
    value: value,
  });

  return {
    container,
    input,
  };
}

// Use the grouped components
const nameField = createFormField("Name:", "", 2);
const emailField = createFormField("Email:", "", 8);
```

## Troubleshooting

### Common Issues

**Issue: UI elements not displaying correctly**

Potential causes:

- Elements are outside the visible area
- Parent container is too small
- Z-index issues with overlapping elements

Solution:

```typescript
// Add border to help visualize container boundaries
render("box", {
  // ... other props
  border: true,
  style: { border: { fg: "red" } }, // Highlighted border
});
```

**Issue: Keyboard input not working**

Potential causes:

- No element has focus
- Event handlers are not properly attached
- Input events are being captured by the wrong element

Solution:

```typescript
// Explicitly set focus and check focused element
someElement.element.focus();
console.log("Focused element:", screen.focused);

// Check if event handlers are attached
console.log("Key handlers:", Object.keys(screen.keypressHandlers));
```

**Issue: Screen not updating**

Potential cause:

- Missing `screen.render()` call after updates

Solution:

```typescript
// Always call render after making changes
element.update({ content: "New content" });
screen.render(); // Don't forget this!
```

**Issue: Components disappearing**

Potential cause:

- Components being replaced or removed accidentally

Solution:

```typescript
// Store all important components in an object for tracking
const components = {
  header: null,
  sidebar: null,
  content: null,
};

// Update the references when creating
components.header = render("text", { content: "Header" });

// Now you can check if they still exist
if (!components.header.element.parent) {
  console.log("Header was removed from the DOM!");
}
```

### Debugging Techniques

1. **Visual Debugging**: Add borders to visualize layout issues.

```typescript
render("box", {
  // ... other props
  border: true,
  label: " Debug Container ",
});
```

2. **Log Component State**: Create a debug panel to display state.

```typescript
const debugPanel = render("box", {
  bottom: 0,
  height: 5,
  width: "100%",
  border: true,
  label: " Debug ",
});

function updateDebug() {
  debugPanel.update({
    content: `Count: ${count}, Selected: ${selectedIndex}, Focus: ${screen.focused?.type}`,
  });
  screen.render();
}
```

3. **Test Individual Components**: Isolate components to test them.

```typescript
// Create a test app for a specific component
function testInputComponent() {
  const screen = initializeScreen({ title: "Input Test" });
  let value = "";

  const input = render("input", {
    width: 30,
    height: 3,
    border: true,
    onSubmit: (v) => {
      value = v;
      debug.update({ content: `Submitted: ${value}` });
      screen.render();
    },
  });

  const debug = render("text", {
    top: 5,
    content: "Type something...",
  });

  input.element.focus();
  screen.render();
}

// Run the test
testInputComponent();
```
