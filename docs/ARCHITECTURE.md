# SvelTUI Architecture

This document describes the architecture of SvelTUI, a terminal UI framework that uses Svelte 5 as its core.

## Overview

SvelTUI provides a way to build interactive terminal user interfaces using Svelte 5 components. Unlike wrapper libraries, SvelTUI implements a direct Svelte 5 integration via a custom compiler plugin that renders Svelte components to the terminal, bringing the full power of Svelte's reactivity and component model to terminal applications.

## Core Components

SvelTUI's architecture consists of several core components that work together to provide a seamless Svelte 5 experience in the terminal:

1. **Compiler Plugin**: A custom Svelte compiler plugin that transforms Svelte components for terminal rendering.
2. **Terminal Renderer**: Renders components to the terminal using the blessed library and Svelte 5's mount/unmount APIs.
3. **Virtual Terminal DOM**: Maintains a virtual representation of the terminal UI with bidirectional binding.
4. **Reconciler**: Efficiently updates the terminal when state changes through batched operations.
5. **Layout Engine**: Calculates component positions and dimensions using flexible layouts.
6. **Runtime DOM Connector**: Bridges Svelte 5's runtime to our terminal-optimized DOM implementation.
7. **Event System**: Maps terminal events to DOM-like events for Svelte components.

### Compiler Plugin

The compiler plugin transforms Svelte components into terminal-specific code. It intercepts Svelte's DOM operations and replaces them with calls to our terminal DOM API.

Key files:
- `src/compiler/index.ts`: Main plugin entry point that handles Svelte's code transformation
- `src/compiler/transform.ts`: Transformation utilities for DOM methods
- `src/compiler/nodes.ts`: Node-specific transformations for different AST node types

The compiler plugin runs at build time and transforms code like this:

```javascript
// Before transformation (Svelte-generated code)
document.createElement('div');
element.setAttribute('class', 'container');
parent.appendChild(child);

// After transformation
__sveltui_createElement('box');
__sveltui_setAttribute(element, 'class', 'container');
__sveltui_appendChild(parent, child);
```

### Virtual Terminal DOM

The virtual DOM provides a complete DOM-like API that Svelte can use directly. It maintains a hierarchical representation of the UI elements and their properties, with bidirectional binding to terminal elements.

Key files:
- `src/dom/nodes.ts`: Node type definitions and interfaces
- `src/dom/elements.ts`: Terminal element type definitions and interfaces
- `src/dom/document.ts`: DOM document implementation
- `src/dom/factories.ts`: Terminal element factories that create blessed elements
- `src/dom/index.ts`: DOM API exports

The virtual DOM implements interfaces like `TerminalNode`, `TerminalElementNode`, and `TerminalTextNode` that mirror the browser DOM. Each DOM node is connected to a terminal element via bidirectional binding, allowing efficient updates.

### Terminal Renderer

The renderer integrates directly with Svelte 5's mount/unmount APIs. It manages the terminal screen and efficiently renders components to it.

Key files:
- `src/renderer/index.ts`: Main renderer API
- `src/renderer/screen.ts`: Terminal screen management
- `src/renderer/render.ts`: Component rendering logic and lifecycle
- `src/renderer/svelte-renderer.ts`: Direct Svelte 5 integration

The renderer provides a public `render` function that takes a Svelte component and renders it to the terminal. It handles component lifecycle, props updates, and screen management.

### Reconciler

The reconciler implements an efficient algorithm for updating the terminal when state changes. It batches operations and applies them in the most efficient way possible.

Key files:
- `src/reconciler/index.ts`: Main reconciler implementation with operation scheduling
- `src/reconciler/operations.ts`: Terminal element operations (create, update, delete)

The reconciler collects operations like element creation, updates, and deletions, and processes them in batches. It ensures that only the necessary changes are applied to the terminal, minimizing flickering and redraw operations.

### Layout Engine

The layout engine calculates the positions and dimensions of components. It supports flexbox-like layouts and optionally integrates with the Yoga layout engine for more complex layouts.

Key files:
- `src/layout/index.ts`: Core layout implementation
- `src/layout/yoga.ts`: Yoga layout engine integration

The layout engine translates CSS-like layout properties to terminal positions and dimensions, allowing components to be arranged in flexible layouts.

### Runtime DOM Connector

The runtime DOM connector is the bridge between Svelte 5's runtime and our terminal DOM. It maps DOM operations to terminal operations at runtime.

Key files:
- `src/api/runtime.ts`: Runtime DOM connector with Svelte integration points
- `src/api/index.ts`: Public API exports

The runtime connector provides implementations of DOM methods like `createElement`, `appendChild`, `setAttribute`, etc. When Svelte's runtime calls these methods, they update both the virtual DOM and the terminal elements via the reconciler.

### Event System

The event system maps terminal events (keyboard, mouse, etc.) to DOM-like events that Svelte components can listen for.

Key part of `src/api/runtime.ts` handles:
- Mapping terminal events to DOM events
- Creating synthetic event objects
- Managing event listeners
- Bubble events through the component hierarchy

## Integration with Svelte 5

SvelTUI integrates directly with Svelte 5's mount/unmount APIs:

1. The compiler plugin transforms Svelte components to use our terminal DOM API
2. The runtime connector provides the API implementation that Svelte calls at runtime
3. The renderer uses Svelte 5's mount API to create components
4. Svelte's reactivity triggers DOM operations that our runtime connector handles
5. The reconciler efficiently updates the terminal based on these operations

## Data Flow

1. The Svelte compiler with our plugin transforms Svelte components into terminal-specific code
2. When a component is rendered, the renderer creates a screen and root element
3. The component is mounted using Svelte 5's mount API
4. The mounted component's code calls our runtime DOM connector methods
5. The runtime connector updates the virtual DOM and queues operations in the reconciler
6. The reconciler batches operations and applies them efficiently to the terminal
7. When state changes, Svelte's reactivity triggers DOM updates
8. These updates flow through the runtime connector to the reconciler
9. The reconciler applies the minimal set of changes to the terminal

## Component Lifecycle

1. User calls `render(App, options)`
2. Renderer creates a terminal screen and root element
3. Svelte component is mounted to the root element using Svelte 5's mount API
4. Component creates virtual DOM nodes through the runtime connector
5. Reconciler processes operations and updates the terminal
6. State changes trigger Svelte's reactivity system
7. Reactivity triggers DOM operations handled by our runtime connector
8. Reconciler efficiently updates the terminal
9. When component is unmounted, Svelte 5's unmount API is called
10. Cleanup destroys terminal elements and frees resources

## Event Handling

1. User interacts with terminal (keyboard, mouse, etc.)
2. Blessed library generates terminal events
3. Our event system maps these to DOM-like events
4. Events are dispatched to the appropriate components
5. Svelte event handlers respond to events
6. State changes trigger updates as described above

## Theming System

SvelTUI includes a theming system that allows customizing the appearance of components:

1. Themes defined in YAML files in the `themes/` directory
2. Components can access theme values via the theme utilities
3. Themes can be switched at runtime

## Future Plans

- Complete Yoga layout engine integration
- Enhanced animation and transition system
- More built-in UI components
- State persistence
- Improved testing infrastructure
- Interactive component inspector
- Performance optimizations
- Accessibility enhancements