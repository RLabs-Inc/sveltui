# SvelTUI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A true Svelte 5 renderer for terminal user interfaces, inspired by Ink for React.

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=SvelTUI:+Svelte+for+Terminal" alt="SvelTUI Demo Screenshot" width="80%">
</p>

## Overview

SvelTUI allows you to build beautiful terminal user interfaces using Svelte 5 components. Unlike wrapper libraries, SvelTUI implements a custom Svelte compiler plugin that renders Svelte components directly to the terminal, bringing the full power of Svelte to terminal applications.

## Why SvelTUI?

- **Direct Svelte 5 Integration** - Uses Svelte 5's mount/unmount APIs for true integration
- **Write Regular Svelte** - Use standard Svelte 5 components with familiar syntax and runes
- **Reactive Terminal UIs** - Svelte 5's reactivity system makes terminal UIs dynamic
- **Efficient Updates** - Batched operations and reconciliation for minimal terminal redraws
- **Complete Feature Support** - Full Svelte 5 feature set including state, effects, and lifecycle
- **TypeScript Support** - Fully typed for better development experience

## Installation

```bash
# Install dependencies
bun install

# Run the example application
bun run example
```

## Features

- **Write Once, Render Anywhere** - Same components work in browser and terminal
- **Full Svelte 5 Support** - Complete Svelte 5 feature set in the terminal
- **Custom Components** - Create your own terminal UI components with Svelte
- **Reactive Updates** - Efficient reactivity in the terminal
- **Layout Engine** - Flexbox-like layout in the terminal with Yoga integration
- **Keyboard & Mouse Navigation** - Built-in event handling support
- **Theming System** - Comprehensive theming capabilities
- **Focus Management** - Intelligent focus handling for interactive components
- **Bidirectional DOM Binding** - Clean DOM-to-terminal element binding

## Basic Usage

```svelte
<!-- App.svelte -->
<script>
  // Svelte 5 runes for reactivity
  let count = $state(0);
  let items = $state(["Item 1", "Item 2", "Item 3"]);
  let selected = $state(0);

  // Reactivity with $derived
  $derived selectedItem = items[selected];
  $derived hasItems = items.length > 0;

  function increment() {
    count++;
  }

  function handleSelect(event) {
    selected = event.detail.index;
  }
  
  // Effects for side effects
  $effect(() => {
    console.log(`Selection changed: ${selectedItem}`);
  });
</script>

<box border label="SvelTUI Demo">
  <text>Count: {count}</text>
  <button on:press={increment}>Increment</button>
  
  <list 
    items={items}
    selected={selected}
    on:select={handleSelect}
  />
  
  <text>Selected: {selectedItem}</text>
</box>
```

```typescript
// main.ts
import { render } from 'sveltui';
import App from './App.svelte';

render(App, {
  // Optional configuration
  title: 'My Terminal App',
  fullscreen: true,
  debug: false,
  theme: 'dark'
});
```

## Architecture

SvelTUI implements a custom Svelte 5 renderer for the terminal, with direct integration via Svelte 5's mount/unmount APIs.

The architecture consists of:

1. **Custom Compiler Plugin** - Transforms Svelte components for terminal rendering
2. **Terminal Renderer** - Renders components to the terminal using Svelte 5's mount/unmount APIs
3. **Virtual Terminal DOM** - Maintains a virtual representation of the terminal UI with bidirectional binding
4. **Reconciler** - Efficiently batch-processes updates to the terminal
5. **Layout Engine** - Calculates component positions and dimensions with Yoga support
6. **Runtime DOM Connector** - Bridges Svelte 5's runtime to our terminal DOM

For more details, see the [Architecture Documentation](docs/ARCHITECTURE.md).

## Component Implementation

SvelTUI components are built using Svelte 5's component model and runes system:

```svelte
<script>
  // Import theme
  import { getTheme } from '../theme/currentTheme.svelte';
  
  // Props with defaults
  let {
    value = '',
    width = 20,
    height = 1,
    border = true,
  } = $props();
  
  // Local state
  let focused = $state(false);
  
  // Get theme
  const theme = getTheme();
  
  // Event handlers
  function handleFocus() {
    focused = true;
  }
  
  function handleBlur() {
    focused = false;
  }
</script>

<input
  value={value}
  width={width}
  height={height}
  border={border}
  style={{
    bg: focused ? theme.colors.focusBg : theme.colors.bg,
    fg: theme.colors.fg,
    border: {
      fg: focused ? theme.colors.focusBorder : theme.colors.border
    }
  }}
  on:focus={handleFocus}
  on:blur={handleBlur}
/>
```

For more details, see the [Component Implementation Strategy](docs/COMPONENT_IMPLEMENTATION_STRATEGY.md).

## Built-in Components

SvelTUI includes a set of built-in components for common terminal UI elements:

| Component | Description |
|-----------|-------------|
| `<box>` | Container component with borders and title support |
| `<text>` | Text display with styling options |
| `<list>` | Interactive, selectable list |
| `<input>` | Text input field |
| `<checkbox>` | Checkbox for boolean selection |
| `<button>` | Pressable button |
| `<progress>` | Progress bar |

## Theming

SvelTUI supports a flexible theming system:

```typescript
// Apply a theme
import { setTheme } from 'sveltui';
setTheme('dark');

// Use theme in components
import { getTheme } from 'sveltui';
const theme = getTheme();

<text style={{ fg: theme.colors.primary }}>Themed Text</text>
```

## Development

SvelTUI is under active development. Contributions are welcome!

```bash
# Run development server
bun run dev

# Build the library
bun run build

# Run tests
bun run test
```

## Roadmap

- Complete Yoga layout engine integration
- Enhanced animation and transition system
- More built-in UI components
- State persistence
- Improved testing infrastructure
- Interactive component inspector
- Performance optimizations
- Accessibility enhancements

## License

MIT © [RLabs Inc.](LICENSE)