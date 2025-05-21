# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SvelTUI is a true Svelte 5 terminal UI renderer, inspired by Ink for React. It enables building interactive terminal interfaces using Svelte 5 components. The project leverages a custom Svelte compiler plugin to translate Svelte components directly into terminal UI elements, rather than DOM operations.

## Commands

```bash
# Install dependencies
bun install

# Run the development server with auto-reload
bun run dev

# Build the library
bun run build

# Run the example application
bun run example

# Run tests
bun test
```

## Architecture Overview

SvelTUI implements a custom renderer for Svelte 5 that targets terminal interfaces instead of the DOM.

### Core Architecture

1. **Compiler Plugin** (`src/compiler/`)
   - Custom Svelte compiler plugin that transforms Svelte components
   - Intercepts DOM operations and replaces with terminal operations
   - Generates optimized code for terminal rendering

2. **Terminal Renderer** (`src/renderer/`)
   - Initializes and manages the terminal screen (using Blessed)
   - Handles rendering of components to the terminal
   - Directly integrates with Svelte 5's mount/unmount APIs
   - Manages render timing and batching

3. **Reconciler** (`src/reconciler/`)
   - Implements the algorithm for applying updates to the terminal
   - Manages component mounting, updates, and unmounting
   - Tracks component tree and instance state
   - Efficiently batch-processes updates to minimize terminal redraws

4. **Virtual Terminal DOM** (`src/dom/`)
   - Defines a virtual representation of terminal elements
   - Tracks element hierarchies and properties
   - Provides an abstraction layer over the terminal library
   - Implements bidirectional DOM-to-terminal element binding

5. **Layout Engine** (`src/layout/`)
   - Implements Flexbox-like layout capabilities for terminal elements
   - Calculates positioning and dimensions for nested components
   - Integrates with Yoga layout engine for advanced layouts

6. **Runtime API** (`src/api/`)
   - Provides high-level APIs for component developers
   - Manages runtime DOM operations from Svelte components
   - Handles events and maps them to terminal inputs
   - Implements terminal-specific attribute handling

### Reactivity Integration

SvelTUI deeply integrates with Svelte 5's reactivity system:

- Compiler plugin translates reactive declarations to terminal-appropriate updates
- DOM operations are intercepted and mapped to terminal operations
- State changes trigger efficient reconciliation for minimal terminal updates
- Events from terminal inputs are mapped to Svelte events

### Core Design Goals

1. **Write Once, Render Anywhere** - Same Svelte components work in browser and terminal
2. **Full Svelte 5 Feature Support** - Support the complete set of Svelte 5 features
3. **Optimal Terminal Performance** - Efficient updates minimizing terminal redraws
4. **Seamless Developer Experience** - Natural Svelte development experience

## Component Authoring

Components are written using standard Svelte 5 syntax with Runes:

```svelte
<script>
  let { title = 'Default Title', items = [] } = $props();
  let selected = $state(0);
  
  function handleSelect(index) {
    selected = index;
  }
</script>

<box border>
  <text bold>{title}</text>
  <list 
    items={items} 
    selected={selected}
    onSelect={handleSelect}
  />
</box>
```

## File Organization

The project follows this organizational pattern:

- `src/compiler/` - Custom Svelte compiler plugin
  - `index.ts` - Plugin entry point
  - `transform.ts` - AST transformation logic
  - `nodes.ts` - Node type definitions and handlers
- `src/renderer/` - Terminal rendering system
  - `index.ts` - Renderer API
  - `screen.ts` - Terminal screen management
  - `render.ts` - Component rendering logic
  - `svelte-renderer.ts` - Svelte 5 integration
- `src/reconciler/` - Update reconciliation
  - `index.ts` - Reconciler API
  - `operations.ts` - Element operations (create, update, delete)
- `src/dom/` - Virtual Terminal DOM
  - `index.ts` - DOM API
  - `elements.ts` - Terminal element definitions
  - `nodes.ts` - Node management
  - `document.ts` - DOM document implementation
  - `factories.ts` - Terminal element factories
- `src/api/` - Runtime API and connectors
  - `index.ts` - Public API exports
  - `runtime.ts` - Runtime DOM connector for Svelte
- `src/layout/` - Layout engine
  - `index.ts` - Layout API
  - `yoga.ts` - Yoga layout integration
- `src/components/ui/` - Built-in components
  - `Box.svelte` - Container component
  - `Text.svelte` - Text display component
  - `List.svelte` - Interactive list component
  - `Input.svelte` - Input component
  - `Checkbox.svelte` - Checkbox component
- `examples/` - Example applications
- `themes/` - Theme definitions

## Integration with Svelte 5

SvelTUI integrates directly with Svelte 5's mount/unmount APIs:

1. The compiler plugin transforms Svelte components to use terminal-specific elements
2. The runtime DOM connector maps DOM operations to terminal operations
3. The renderer uses Svelte 5's mount/unmount APIs directly
4. The reconciler efficiently manages updates to the terminal

## Debugging Tips

1. Use the `--debug` flag for verbose logging
2. Check the compiled output to understand Svelte transformations
3. Use the reconciler's debug mode to see operations being applied
4. For layout issues, enable layout debugging with `--debug-layout`
5. Monitor the terminal screen object for rendering issues

## Key Implementation Details

1. The DOM implementation provides a complete DOM-like API for Svelte 5
2. Terminal elements are created by factories that map to blessed elements
3. The reconciler batches operations for efficient terminal updates
4. Events from the terminal are mapped to DOM-like events for Svelte
5. The compiler plugin transforms Svelte components at build time