# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
bun install

# Run the development server with auto-reload
bun run dev

# Build the library
bun run build

# Run the demo example
bun run example
```

## Architecture Overview

SveltUI is a terminal UI (TUI) library that combines Svelte 5's reactivity system with the blessed library for terminal interfaces.

### Core Components

1. **Renderer System** (`src/core/renderer.svelte.ts`)
   - Initializes the blessed screen
   - Handles rendering elements to the terminal
   - Manages the update lifecycle

2. **Component Registry** (`src/core/registry.svelte.ts`)
   - Maintains a registry of available components
   - Provides component definitions with create/update methods
   - Initializes built-in components like Box, Text, Input and List

3. **Reconciler** (`src/core/reconciler.svelte.ts`)
   - Tracks component instances and their state
   - Manages component lifecycles
   - Handles reactive updates to components

4. **Blessed Utils** (`src/core/blessed-utils.svelte.ts`)
   - Provides utilities for creating and updating blessed elements
   - Maps SveltUI props to blessed props
   - Sets up event handlers for components

### UI Components

Components are defined as Svelte 5 components with the new runes syntax (`$props`, `$state`, etc.). 
The rendering is handled by the SveltUI core rather than Svelte's own DOM-based renderer.

### Reactivity System

SveltUI uses a simplified reactivity model based on Svelte 5 runes:
- `$state`: For top-level reactive state variables
- Uses direct updates instead of complex effect chains
- Updates are triggered at the point of state change, not through observers

This approach favors simplicity and directness over complex reactive dependency chains.

#### Reactivity Implementation Notes

The project uses Svelte 5's native runes system through Vite:

1. `svelte.config.ts`: Configures Svelte with runes enabled
2. `vite.config.ts`: Configures Vite to process Svelte files with runes
3. All `.svelte.ts` files use runes natively

The update model is direct: when state changes, the relevant updates are immediately applied rather than relying on reactive effects to detect changes. This makes the code more predictable and easier to debug.

#### Key Handling Best Practices

When implementing keyboard interactions:

1. Use the keypress event for most reliable keyboard input handling:
```javascript
// Use the keypress event for global key handling
screen.on('keypress', function(ch, key) {
  // Handle exit keys
  if (key.name === 'q' || key.name === 'escape' || (key.ctrl && key.name === 'c')) {
    process.exit(0);
  }
  // Handle + key for incrementing counter
  else if (ch === '+') {
    count++;
    headerElement.update({ content: `Count: ${count}` });
    screen.render();
  }
});
```

2. Always call `screen.render()` after state changes to update the UI.

3. Remember to handle both character (`ch`) and key object properties for maximum compatibility.

4. Explicitly maintain references to UI elements and update them directly:
```javascript
const headerElement = render("text", {
  content: "Header content"
});

// Later when updating:
headerElement.update({ content: "New content" });
screen.render();
```

5. Understand input field focus behavior - users can press Escape to exit input mode:
```javascript
// Input fields capture keypresses while focused
// Users need to press Escape to exit input mode
screen.key('tab', () => {
  inputElement.element.focus();
  screen.render();
});

// Consider adding help text to guide users
render("text", {
  content: "Press [Tab] to focus input, [Esc] to exit input mode",
  style: { fg: "gray" }
});
```

6. For menu/list navigation, consider implementing a custom solution with direct key handlers:
```javascript
// Custom menu navigation with arrow keys
screen.key('up', () => {
  if (selectedIndex > 0) {
    selectedIndex--;
    updateMenu();
    screen.render();
  }
});

screen.key('down', () => {
  if (selectedIndex < items.length - 1) {
    selectedIndex++;
    updateMenu();
    screen.render();
  }
});
```

7. Use tags for colored text in blessed:
```javascript
// Enable tags in your component
const box = render("box", {
  tags: true,  // Important: enable tag parsing
  content: "{blue-bg}{white-fg}Highlighted Text{/white-fg}{/blue-bg}"
});

// Available styles include:
// Colors: black, red, green, yellow, blue, magenta, cyan, white
// Modifiers: bold, underline, blink, inverse
// Use as: {red-fg}Red Text{/red-fg} or {blue-bg}Blue Background{/blue-bg}
```

8. Be careful with element event handlers - verify the parameter order and types:
```javascript
// In blessed-utils.svelte.ts for list items:
element.on("select item", (item, index) => {
  // Ensure item is a string before passing to callback
  const itemValue = typeof item === 'string' ? item : String(item);
  props.onSelect(index, itemValue);
});
```

## Reference Resources

The `/docs/svelte5/` directory contains valuable reference material about Svelte 5's internals:

- `svelte-5-compiler.md`: Details of the Svelte 5 compiler implementation
- `svelte-5-dom.md`: Svelte 5's DOM rendering system
- `svelte-5-reactivity.md`: Complete documentation of Svelte 5's reactivity system

Consult these files when you need deeper understanding of how Svelte 5's internal mechanisms work, especially when implementing or debugging reactivity features.