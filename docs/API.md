# SveltUI API Documentation

This document provides detailed information about the SveltUI API, including core functions, components, and usage patterns.

## Table of Contents

- [Core API](#core-api)
  - [initializeScreen](#initializescreen)
  - [render](#render)
- [Component API](#component-api)
  - [Box](#box)
  - [Text](#text)
  - [Input](#input)
  - [List](#list)
- [Events and Interactivity](#events-and-interactivity)
  - [Key Handling](#key-handling)
  - [Focus Management](#focus-management)
  - [Event Handlers](#event-handlers)
- [Advanced Usage](#advanced-usage)
  - [Styling](#styling)
  - [Layout Techniques](#layout-techniques)
  - [Component Lifecycle](#component-lifecycle)

## Core API

### initializeScreen

Initializes a new blessed screen instance for rendering terminal UI elements.

```typescript
function initializeScreen(options?: blessed.Widgets.IScreenOptions): blessed.Widgets.Screen
```

**Parameters:**
- `options` (optional): Configuration options for the blessed screen.

**Returns:**
- A blessed screen instance that serves as the root for all UI elements.

**Example:**
```typescript
const screen = initializeScreen({
  title: "My Terminal UI App",
  smartCSR: true,
  fullUnicode: true,
});
```

**Options:**
- `title`: The terminal window title
- `smartCSR`: Enable efficient redrawing (recommended: `true`)
- `fullUnicode`: Support for unicode characters
- For more options, see the [blessed documentation](https://github.com/chjj/blessed#screen-options)

### render

Creates and renders a UI element to the terminal screen.

```typescript
function render(
  elementType: string,
  props: Record<string, any> = {},
  target: blessed.Widgets.Screen | blessed.Widgets.BlessedElement = screen!
): RenderResult
```

**Parameters:**
- `elementType`: The type of element to create (e.g., "box", "text", "list", "input")
- `props`: Properties to apply to the element
- `target`: The parent element (defaults to the screen)

**Returns:**
A `RenderResult` object with:
- `element`: The blessed element instance
- `update(newProps)`: Method to update the element with new properties
- `unmount()`: Method to remove the element from the screen

**Example:**
```typescript
const box = render("box", {
  width: "50%",
  height: "50%",
  border: true,
  style: {
    border: {
      fg: "blue",
    },
  },
});

// Later update the box
box.update({
  style: {
    border: {
      fg: "red",
    },
  },
});

// Remove the box
box.unmount();
```

## Component API

SveltUI provides several built-in components that wrap blessed elements.

### Box

A basic container element.

**Properties:**
- `width`: Width of the box (number, string, or percentage)
- `height`: Height of the box (number, string, or percentage)
- `top`: Top position (number, string, or percentage)
- `left`: Left position (number, string, or percentage)
- `border`: Whether to show a border (boolean)
- `style`: Styling options
  - `border`: Border style (`{ fg: string, bg: string }`)
  - `bg`: Background color
  - `fg`: Foreground color

**Example:**
```typescript
const main = render("box", {
  width: "100%",
  height: "100%",
  border: true,
  style: {
    border: {
      fg: "blue",
    },
  },
});
```

### Text

Displays text content.

**Properties:**
- `content`: The text content to display
- `width`: Width of the text element
- `height`: Height of the text element
- `top`: Top position
- `left`: Left position
- `style`: Text styling
  - `fg`: Foreground color
  - `bg`: Background color
  - `bold`: Bold text (boolean)
  - `underline`: Underlined text (boolean)
- `tags`: Whether to process color tags in the content (boolean)

**Example:**
```typescript
const text = render("text", {
  parent: main.element,
  top: 1,
  left: "center",
  content: "Hello SveltUI!",
  style: {
    fg: "white",
    bold: true,
  },
});
```

**Color Tags (when `tags: true`):**
```typescript
render("text", {
  tags: true,
  content: "{red-fg}Red Text{/red-fg} and {blue-bg}Blue Background{/blue-bg}"
});
```

### Input

A text input field.

**Properties:**
- `value`: Current input value
- `placeholder`: Placeholder text when empty
- `width`: Width of the input
- `height`: Height of the input
- `top`: Top position
- `left`: Left position
- `border`: Whether to show a border
- `style`: Input styling
- `inputOnFocus`: Whether to start input mode when focused
- `onChange`: Handler for value changes
- `onSubmit`: Handler for submit events (Enter key)

**Example:**
```typescript
const input = render("input", {
  parent: main.element,
  top: 10,
  left: "center",
  width: "60%",
  height: 3,
  border: true,
  value: inputValue,
  onChange: (value) => {
    console.log("Input changed:", value);
  },
  onSubmit: (value) => {
    console.log("Input submitted:", value);
    input.update({ value: "" }); // Clear input
  },
});
```

### List

A selectable list of items.

**Properties:**
- `items`: Array of items to display
- `selected`: Index of selected item
- `width`: Width of the list
- `height`: Height of the list
- `top`: Top position
- `left`: Left position
- `border`: Whether to show a border
- `style`: List styling
  - `selected`: Styling for selected item
  - `item`: Styling for items
- `keys`: Whether to enable keyboard navigation
- `mouse`: Whether to enable mouse interaction
- `onSelect`: Handler for item selection

**Example:**
```typescript
const list = render("list", {
  parent: main.element,
  top: 4,
  left: "center",
  width: "50%",
  height: 8,
  items: ["Option 1", "Option 2", "Option 3"],
  border: true,
  style: {
    selected: {
      bg: "blue",
      fg: "white",
    },
  },
  onSelect: (item, index) => {
    console.log(`Selected item ${item} at index ${index}`);
  },
});
```

## Events and Interactivity

### Key Handling

SveltUI provides multiple ways to handle keyboard input.

**Global Key Event:**
```typescript
// Recommended: Use keypress for most reliable key handling
screen.on('keypress', function(ch, key) {
  // ch: Character (string or undefined)
  // key: Key information object with properties like name, ctrl, shift, etc.
  
  if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
    process.exit(0);
  } else if (ch === '+') {
    count++;
    updateUI();
  }
});
```

**Specific Key Handlers:**
```typescript
// Alternative: Specific key handlers
screen.key('q', () => process.exit(0));
screen.key('+', () => {
  count++;
  updateUI();
});
```

**Component-specific Keys:**
```typescript
// Add key handlers to specific components
listElement.element.key('enter', () => {
  // Handle enter on the list
});
```

### Focus Management

Managing focus is crucial for keyboard navigation.

**Setting Focus:**
```typescript
// Focus a specific element
listElement.element.focus();
screen.render();
```

**Checking Focus:**
```typescript
if (screen.focused === inputElement.element) {
  // Input has focus
}
```

**Tab Navigation:**
```typescript
// Handle tab key for focus cycling
screen.key('tab', () => {
  if (screen.focused === listElement.element) {
    inputElement.element.focus();
  } else {
    listElement.element.focus();
  }
  screen.render();
});
```

### Event Handlers

Components can respond to various events.

**Click Events:**
```typescript
const button = render("box", {
  content: "Click Me",
  width: 10,
  height: 3,
  border: true,
  onClick: () => {
    console.log("Button clicked!");
  }
});
```

**Input Events:**
```typescript
render("input", {
  // onChange fires on every keystroke
  onChange: (value) => {
    console.log("Input changed:", value);
  },
  // onSubmit fires when Enter is pressed
  onSubmit: (value) => {
    console.log("Input submitted:", value);
  }
});
```

**List Selection:**
```typescript
render("list", {
  items: ["One", "Two", "Three"],
  onSelect: (item, index) => {
    console.log(`Selected ${item} at index ${index}`);
  }
});
```

## Advanced Usage

### Styling

SveltUI supports rich styling options for all components.

**Text Styling:**
```typescript
render("text", {
  content: "Styled Text",
  style: {
    fg: "white",     // Foreground color
    bg: "blue",      // Background color
    bold: true,      // Bold text
    underline: true, // Underlined text
    blink: true,     // Blinking text
    inverse: true,   // Inverse colors
  }
});
```

**Border Styling:**
```typescript
render("box", {
  border: true,
  style: {
    border: {
      fg: "red",    // Border color
      bg: "black",  // Border background
      type: "line", // Border type
    }
  }
});
```

**Available Colors:**
- Basic: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`
- Bright: `brightblack`, `brightred`, `brightgreen`, `brightyellow`, `brightblue`, `brightmagenta`, `brightcyan`, `brightwhite`
- Hex: `#ff0000`, `#00ff00`, `#0000ff`, etc.

### Layout Techniques

SveltUI supports flexible layout options.

**Absolute Positioning:**
```typescript
render("text", {
  top: 10,   // 10 lines from top
  left: 20,  // 20 columns from left
  content: "Positioned text"
});
```

**Percentage-based Sizing:**
```typescript
render("box", {
  width: "50%",  // 50% of parent width
  height: "30%", // 30% of parent height
  content: "Percentage-based box"
});
```

**Centered Content:**
```typescript
render("text", {
  top: "center",  // Vertically centered
  left: "center", // Horizontally centered
  content: "Centered text"
});
```

**Relative Positioning:**
```typescript
render("text", {
  top: "50%+1",  // 1 line below center
  left: "25%+5", // 5 columns right of 25% mark
  content: "Relative positioned text"
});
```

### Component Lifecycle

Understanding the component lifecycle helps manage resources effectively.

**Creation:**
```typescript
// Create and render a component
const element = render("box", { /* props */ });
```

**Updates:**
```typescript
// Update an existing component
element.update({ 
  content: "New content",
  style: { fg: "green" }
});
screen.render(); // Ensure changes are rendered
```

**Cleanup:**
```typescript
// Remove a component
element.unmount();

// Clean exit when application ends
process.on('SIGINT', () => {
  screen.destroy();
  process.exit(0);
});
```

---

## Further Resources

- [Blessed Documentation](https://github.com/chjj/blessed)
- [Svelte 5 Runes Documentation](https://svelte.dev/blog/runes)