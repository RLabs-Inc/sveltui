# SveltUI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

SveltUI is a modern library for building Terminal User Interfaces (TUIs) that combines the elegance of Svelte 5's reactivity system with the power of the blessed terminal library.

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=SveltUI+Terminal+Interface" alt="SveltUI Demo Screenshot" width="80%">
</p>

## Why SveltUI?

- **Reactive by design** - Leverage Svelte 5's runes for a truly reactive terminal UI experience
- **Component-based** - Build your terminal UIs using a familiar component-based approach
- **Simple API** - Intuitive API designed for developer productivity
- **TypeScript support** - Fully typed for better development experience
- **Lightweight** - Minimal overhead and dependencies

## Installation

To install dependencies:

```bash
bun install
```

## Running

To start the development server:

```bash
bun run dev
```

To run the demo examples:

```bash
# Main demo
bun run example

# Component demos
bun run components-demo # All components with focus on debugging
bun run checkbox-demo   # Checkbox component demo
bun run select-demo     # Select dropdown component demo

# Theme demos
bun run theme-demo     # Full theme demo with dual preview lists
bun run theme-simple   # Simple theme demonstration
bun run theme-showcase # Showcase of theme colors and components
```

## Building

To build the library:

```bash
bun run build
```

## Features

- **Reactive Components** - Terminal UI components powered by Svelte 5 runes
- **State Management** - Automatic UI updates when state changes
- **Component Architecture** - Familiar component-based architecture for terminal UIs
- **Svelte Integration** - Leverage your existing Svelte knowledge
- **Keyboard Navigation** - Built-in support for keyboard shortcuts and navigation with [detailed guidelines](docs/KEY_HANDLING.md)
- **Theming System** - Customizable themes with YAML support
- **Styling** - Rich styling options for terminal interfaces
- **Event Handling** - Comprehensive event system for user interactions
- **CLI Support** - Tools for styled terminal output in CLI applications

## Technical Foundation

SveltUI is built on:

- **Svelte 5** - Using the latest runes API for reactivity
- **Blessed** - Powerful terminal UI library for Node.js
- **TypeScript** - Full type support for better developer experience
- **Vite** - Modern build tooling for fast development

The `.svelte.ts` file extension is used for files that leverage Svelte 5 runes.

## Basic Usage

```typescript
import { initializeScreen, render } from "sveltui";

// Create reactive state with Svelte runes
let count = $state(0);
let message = $state("Hello SveltUI!");

// Derived values automatically update
let displayMessage = $derived(`Message: ${message} (Count: ${count})`);

// Initialize the terminal screen
const screen = initializeScreen({
  title: "My TUI App",
});

// Create a container box
const main = render("box", {
  width: "100%",
  height: "100%",
  border: true,
});

// Add some text that will automatically update - keep a reference for updating later
const textElement = render("text", {
  parent: main.element,
  top: "center",
  left: "center",
  content: displayMessage,
});

// Create an interactive list
const listElement = render("list", {
  parent: main.element,
  top: 5,
  left: "center",
  width: "60%",
  height: 5,
  items: ["Item 1", "Item 2", "Item 3"],
  border: true,
  onSelect: (index, item) => {
    // Update other elements when selection changes
    textElement.update({ content: `Selected: ${item}` });
    screen.render();
  }
});

// Use the keypress event for key handling (recommended approach)
screen.on('keypress', function(ch, key) {
  if (key.name === 'q' || key.name === 'escape' || (key.ctrl && key.name === 'c')) {
    process.exit(0);
  } else if (ch === '+') {
    count++;
    // Important: Manually update UI elements when state changes
    textElement.update({ content: `Count: ${count}` });
    screen.render();
  } else if (ch === '-') {
    count--;
    // Important: Manually update UI elements when state changes
    textElement.update({ content: `Count: ${count}` });
    screen.render();
  } else if (key.name === 'tab') {
    // Give focus to the input field - user can press Escape to exit input mode
    inputElement.element.focus();
    screen.render();
  }
});

// Add help text to guide users
render("text", {
  parent: main.element,
  bottom: 2,
  content: "Press [Tab] to focus input, [Esc] to exit input mode",
  style: { fg: "gray" }
});

// Give initial focus to the list
listElement.element.focus();

// Show the screen
screen.render();
```

## Components

SveltUI includes these built-in components:

| Component | Description | Properties |
|-----------|-------------|------------|
| **Box** | Container element | `width`, `height`, `border`, `style` |
| **Text** | Text display | `content`, `style`, `left`, `top` |
| **Input** | Text input field | `value`, `placeholder`, `onChange`, `onSubmit` |
| **List** | Selectable list | `items`, `selected`, `onSelect`, `style` |
| **Checkbox** | Interactive checkbox | `checked`, `label`, `onChange`, `disabled` |
| **Select** | Dropdown selection | `options`, `value`, `onChange`, `placeholder` |

All components support standard positioning properties like `left`, `top`, `width`, and `height`.

## Theming

SveltUI includes a powerful theming system that allows you to customize the appearance of your terminal UI.

### Using Built-in Themes

```typescript
import { initializeScreen, render, setTheme, DarkTheme, LightTheme, TerminalTheme } from "sveltui";

// Use the dark theme
setTheme(DarkTheme);

// Create your UI components as usual
const screen = initializeScreen();
const box = render("box", {
  // ...props
});
```

### Creating Custom Themes

You can create custom themes programmatically:

```typescript
import { createTheme, setTheme } from "sveltui";

const purpleTheme = createTheme("Purple", {
  primary: "#9966ff",
  background: "#1a1a2e",
  foreground: "#e6e6ff"
});

setTheme(purpleTheme);
```

### Loading Themes from YAML

You can also load themes from YAML files:

```typescript
import { loadTheme, setTheme } from "sveltui";

const oceanTheme = loadTheme("./themes/ocean.yaml");
if (oceanTheme) {
  setTheme(oceanTheme);
}
```

Example YAML theme file:

```yaml
name: "Ocean"
description: "A soothing blue theme"
author: "RLabs Inc."
version: "1.0.0"

colors:
  primary: "#0077cc"
  secondary: "#00ccbb"
  background: "#05233b"
  foreground: "#e1f2ff"
  
  # Status colors
  success: "#00cc77"
  warning: "#ffbb00"
  error: "#ff5555"
  info: "#55aaff"

derived:
  surfaceColor: "#072e4f"
  mutedText: "#a0c0e0"

components:
  box:
    border:
      color: "#0099ff"
  list:
    item:
      selected:
        background: "#0088dd"
```

### CLI Text Styling

You can use the theme for CLI text output:

```typescript
import { text } from "sveltui";

console.log(text.primary("This text uses the primary color"));
console.log(text.success("Operation completed successfully"));
console.log(text.error("An error occurred"));
console.log(text.muted("This is less important information"));
```

## Best Practices

For detailed component best practices, see [COMPONENT_BEST_PRACTICES.md](docs/COMPONENT_BEST_PRACTICES.md).

### Key Handling

When handling keyboard interactions, use the appropriate method for each component type. For detailed documentation, refer to [KEY_HANDLING.md](docs/KEY_HANDLING.md).

#### For Self-Handling Components (Input, List)

These components handle their own keyboard events internally:

```typescript
// Input Component
const input = render("input", {
  value: myValue,
  onChange: (value) => {
    myValue = value;
    // Update UI as needed
  },
  onSubmit: (value) => {
    // Handle form submission
  }
});

// List Component
const list = render("list", {
  items: ["Item 1", "Item 2", "Item 3"],
  onSelect: (index, item) => {
    // Handle selection
  }
});
```

#### For External-Handling Components (Checkbox, Select)

These components require keyboard event handling at the application level:

```typescript
// Checkbox with toggle handling
const checkbox = render("checkbox", {
  checked: $bindable(false),
  label: "Enable feature",
  onChange: (checked) => {
    console.log(`Checkbox toggled to: ${checked}`);
  }
});

// Handle Enter/Space for checkbox toggle via screen key handler
screen.key(['enter', 'space'], () => {
  if (screen.focused === checkboxElement.element) {
    checkboxElement.update({ checked: !checkboxElement.element.checked });
    screen.render();
  }
});

// Select with dropdown handling
const select = render("select", {
  options: ["Option 1", "Option 2", "Option 3"],
  value: $bindable(""),
  onChange: (value) => {
    console.log(`Selected option: ${value}`);
  }
});

// Handle dropdown open/close and navigation
screen.key(['enter', 'space'], () => {
  if (screen.focused === selectElement.element) {
    selectElement.update({ open: !selectElement.element.open });
    screen.render();
  }
});
```

#### General Screen Key Handling

For global key handling:

```typescript
screen.on('keypress', function(ch, key) {
  // Skip handling when input is focused
  if (inputElement.element === screen.focused) return;
  
  // Handle keys based on character or key name
  if (ch === '+') {
    // Handle + key
  } else if (key.name === 'escape') {
    // Handle escape key
  }
});
```

### Focus Management

Manage focus explicitly for better user experience:

```typescript
// Focus the list initially
listElement.element.focus();

// Add tab key handler to focus input
screen.key('tab', () => {
  inputElement.element.focus();
});

// Add escape handler to return focus to list
screen.key('escape', () => {
  if (inputElement.element === screen.focused) {
    listElement.element.focus();
  }
});
```

### Rendering Updates

Always call `screen.render()` after updating components:

```typescript
count++;
headerElement.update({ content: `Count: ${count}` });
screen.render(); // Don't forget this!
```

## Runtime Support

This project supports:
- **Node.js** 16+
- **Bun** 1.0+

It was initially created using `bun init` in bun v1.1.42. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## License

MIT © [RLabs Inc.](LICENSE)