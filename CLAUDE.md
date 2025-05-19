# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SveltUI is a terminal UI framework that combines Svelte 5's reactivity system with the blessed library to create interactive terminal interfaces. It allows developers to build responsive, component-based terminal applications using familiar Svelte patterns.

## Commands

```bash
# Install dependencies
bun install

# Run the development server with auto-reload
bun run dev

# Build the library
bun run build

# Run the main demo example
bun run example

# Run component demos
bun run checkbox-demo  # Checkbox component demo
bun run select-demo    # Select component demo 

# Run the theme demos
bun run theme-demo     # Full theme demo with dual preview lists
bun run theme-simple   # Simple theme demonstration
bun run theme-showcase # Showcase of theme colors and components
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
   - Initializes built-in components like Box, Text, Input, List, Checkbox, and Select
   - Supports multiple component definitions and variants

3. **Reconciler** (`src/core/reconciler.svelte.ts`)
   - Tracks component instances and their state
   - Manages component lifecycles
   - Handles reactive updates to components

4. **Blessed Utils** (`src/core/blessed-utils.svelte.ts`)
   - Provides utilities for creating and updating blessed elements
   - Maps SveltUI props to blessed props
   - Sets up event handlers for components

5. **Theme System** (`src/core/theme.ts`, `src/core/theme-manager.ts`)
   - Defines the theme interface and color types
   - Provides built-in themes (Terminal, Dark, Light)
   - Manages theme loading from YAML files
   - Applies themes to components
   - Supports custom themes with a simple API

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

9. Using the theming system:
```javascript
// Import theme functions and built-in themes
import { 
  setTheme, 
  getTheme, 
  loadTheme, 
  TerminalTheme, 
  DarkTheme,
  LightTheme 
} from "sveltui";

// Use a built-in theme
setTheme(DarkTheme);

// Load a theme from a YAML file
const customTheme = loadTheme("./themes/custom/ocean.yaml");
if (customTheme) {
  setTheme(customTheme);
}

// Use theme colors in component styling
const button = render("box", {
  content: "Click me",
  style: {
    bg: getTheme().colors.primary,
    fg: "white",
    focus: {
      bg: getTheme().colors.secondary
    }
  }
});

// Handle undefined theme properties safely
function getThemeColor(color, fallback) {
  return color || fallback;
}
```

## Reference Resources

The `/docs/svelte5/` directory contains valuable reference material about Svelte 5's internals:

- `svelte-5-compiler.md`: Details of the Svelte 5 compiler implementation
- `svelte-5-dom.md`: Svelte 5's DOM rendering system
- `svelte-5-reactivity.md`: Complete documentation of Svelte 5's reactivity system

Consult these files when you need deeper understanding of how Svelte 5's internal mechanisms work, especially when implementing or debugging reactivity features.

## API Documentation

Comprehensive API documentation is available in the following files:

- `/docs/API.md`: Complete API reference for all components and utilities
- `/docs/USAGE.md`: Usage examples and patterns for common use cases

## Code Style Guidelines

### General Guidelines

1. Use TypeScript for all code with proper types
2. Prefer explicit types over inferred types where clarity is needed
3. Use Svelte 5 runes for reactivity (`$state`, `$derived`, etc.)
4. Keep functions small and focused on a single responsibility
5. Use clear, descriptive variable and function names

### File Organization

The project follows a specific organizational pattern detailed in `/docs/COMPONENT_PATTERNS.md`. In summary:

- `src/core/`: Core framework functionality
  - `renderer.svelte.ts`: Screen initialization and rendering
  - `reconciler.svelte.ts`: Component reconciliation
  - `registry.svelte.ts`: Component registration
  - `blessed-utils.svelte.ts`: Utilities for working with blessed elements
  - `types.ts`: TypeScript types and interfaces
  - `theme.ts`: Theme interface and built-in themes
  - `theme-manager.ts`: Theme loading, registration, and application
  - `adapters/`: Blessed implementation adapters (connecting Svelte components to blessed)
    - Organized by component category (display, input, container)
    - Each adapter handles the specific blessed implementation details
- `src/components/`: UI components
  - Each component in its own `.svelte` file
  - Components only contain Svelte logic, not blessed implementation details
- `examples/`: Example applications
  - `demo.svelte.ts`: Main example
  - `theme-demo.svelte.ts`: Theme demonstration with dual preview lists
  - `theme-simple-demo.svelte.ts`: Simple theme demo
  - `theme-showcase.svelte.ts`: Showcase of theme colors and components
- `themes/`: Theme files in YAML format
  - `built-in/`: Built-in theme files
  - `custom/`: User-defined theme files

### Component Implementation Pattern

SveltUI components follow a three-part implementation pattern to separate concerns:

1. **Svelte Component Interface (`.svelte` file)**: Defines the public API using Svelte 5 runes
2. **Adapter Implementation (`.svelte.ts` file)**: Connects Svelte to blessed, handling implementation details
3. **Registry Definition**: Registers the component in the SveltUI system

For detailed information, see `/docs/COMPONENT_PATTERNS.md`.

#### Component Structure

Svelte components should follow this structure:

```svelte
<script lang="ts">
  // Import types but NOT blessed-specific code
  import type { ComponentProps } from '../core/types';

  // Component properties with defaults and bindable props
  let {
    // Public properties that can be bound
    value = $bindable(''),
    
    // Event handlers with proper typing
    onChange = undefined as ((value: string) => void) | undefined,
    
    // Optional style and layout properties
    width = '50%',
    height = 3,
    style = {},
  } = $props();
  
  // Internal state
  let isFocused = $state(false);
  
  // Derived values
  let displayValue = $derived(`Value: ${value}`);
  
  // Component methods
  function handleChange(newValue: string) {
    value = newValue;
    if (onChange) onChange(newValue);
  }
  
  // Focus/blur handlers
  function handleFocus() {
    isFocused = true;
  }
  
  function handleBlur() {
    isFocused = false;
  }
  
  // Keyboard navigation (for interactive components)
  function handleKeyNavigation(key: string): boolean {
    // Return true if the key was handled
    return false;
  }
</script>

<!-- No template needed - our renderer handles this -->
```

#### Adapter Structure

Component adapters should follow this structure:

```typescript
import * as blessed from 'blessed';
import { getTheme } from '../theme-manager';

// Create the blessed element
export function createComponentElement(
  props: Record<string, any>,
  parent?: blessed.Widgets.Node
): blessed.Widgets.BlessedElement {
  // Create and configure the element
  const element = blessed.text({
    ...props,
    parent,
    tags: true,
    focusable: true,
  });
  
  // Set up event handlers
  setupEvents(element, props);
  
  // Initialize display
  updateDisplay(element, props);
  
  return element;
}

// Update the element display
export function updateComponentDisplay(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Update element display based on props
  
  // Apply theming
  const theme = getTheme();
  
  // Update content/appearance
}

// Helper functions for this component
function setupEvents(element, props) {
  // Set up events with proper handlers
}

function toggleState(props) {
  // Toggle component state
}
```

## Working with this Project

When working on this project, consider the following guidelines:

1. Always test UI changes with the example applications
2. Ensure keyboard navigation works correctly for all components
3. Maintain backward compatibility when modifying existing components
4. Add comprehensive documentation for new features
5. Keep the implementation simple and focused on the core requirements

## Debugging Tips

When debugging terminal UI issues:

1. Add borders to components to visualize layout issues
2. Use console.log for debugging information
3. Check focus management when keyboard input isn't working
4. Verify that screen.render() is called after state changes
5. Test components in isolation before integrating