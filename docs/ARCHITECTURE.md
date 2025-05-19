# SveltUI Architecture

This document explains the internal architecture of SveltUI and how its components work together.

## Overview

SveltUI is built on two key technologies:

1. **Svelte 5 Runes**: For reactivity and component architecture
2. **Blessed**: For terminal rendering and interactions

The framework bridges these technologies, allowing developers to build terminal user interfaces using a reactive, component-based approach.

## Core Architecture

Here's a diagram of the core architecture:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Svelte 5    │     │    SveltUI    │     │    Blessed    │
│   Components  │────▶│     Core      │────▶│   Terminal    │
│   & Runes     │     │               │     │   Rendering   │
└───────────────┘     └───────────────┘     └───────────────┘
```

### Key Components

SveltUI consists of several key components:

1. **Renderer (`renderer.svelte.ts`)**:
   - Initializes the blessed screen
   - Provides the `render()` function to create UI elements
   - Manages the update cycle for components

2. **Blessed Utils (`blessed-utils.svelte.ts`)**:
   - Converts SveltUI component props to blessed configuration
   - Creates blessed elements based on component type
   - Manages updating blessed elements when props change

3. **Component Types (`types.ts`)**:
   - Defines TypeScript interfaces for components and their properties
   - Provides type safety for the rendering system

4. **Svelte Components**:
   - Define the API for each UI component
   - Use runes for reactivity
   - Provide a clean interface for component users

## Rendering Pipeline

When a component is rendered, it goes through the following pipeline:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Svelte        │     │ render()      │     │ createBlessed │     │ blessed       │
│ Component     │────▶│ Function      │────▶│ Element       │────▶│ Element       │
│ Definition    │     │               │     │               │     │ Rendered      │
└───────────────┘     └───────────────┘     └───────────────┘     └───────────────┘
```

1. **Component Definition**: A Svelte component defines its properties and behavior
2. **Render Function**: The `render()` function is called with the component type and props
3. **Element Creation**: The `createBlessedElement()` function converts SveltUI props to blessed configuration
4. **Element Rendering**: The blessed element is rendered to the terminal

## Update Cycle

When a component's props change, SveltUI updates the rendered element:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ State         │     │ update()      │     │ updateBlessed │
│ Change        │────▶│ Function      │────▶│ Element       │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

1. **State Change**: A reactive state variable changes
2. **Update Function**: The component's `update()` method is called with new props
3. **Element Update**: The `updateBlessedElement()` function applies changes to the blessed element

## Reactivity System

SveltUI uses Svelte 5's runes for reactivity:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ $state        │     │ State         │     │ Manual        │
│ Declaration   │────▶│ Change        │────▶│ UI Update     │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

1. **State Declaration**: Reactive state is declared using `$state()`
2. **State Change**: The state value changes
3. **Manual Update**: The UI is manually updated to reflect the new state

Note that unlike browser-based Svelte, SveltUI doesn't automatically propagate changes to the UI. Instead, developers must explicitly call `element.update()` and `screen.render()` to update the UI.

## Component Lifecycle

Components in SveltUI have a simpler lifecycle than browser-based Svelte:

1. **Creation**: Component is created via `render()`
2. **Updates**: Component is updated via `element.update()`
3. **Destruction**: Component is removed via `element.unmount()`

## Event System

SveltUI uses blessed's event system with some enhancements:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Blessed       │     │ SveltUI       │     │ User          │
│ Event         │────▶│ Event         │────▶│ Event         │
│ Triggered     │     │ Normalization │     │ Handler       │
└───────────────┘     └───────────────┘     └───────────────┘
```

1. **Event Trigger**: A blessed event is triggered (e.g., keypress, mouse click)
2. **Event Normalization**: SveltUI normalizes the event data
3. **Handler Invocation**: The user's event handler is called with the normalized data

## Key Subsystems

### Screen Management

The `initializeScreen()` function creates a blessed screen instance and configures it for use with SveltUI. This screen is used as the root container for all rendered elements.

```typescript
export function initializeScreen(
  options: blessed.Widgets.IScreenOptions = {}
): blessed.Widgets.Screen {
  const defaultOptions: blessed.Widgets.IScreenOptions = {
    smartCSR: true,
    title: "SveltUI Application",
    ...options,
  };

  screen = blessed.screen(defaultOptions);
  screen.render();

  return screen;
}
```

### Component Rendering

The `render()` function is the primary way to create and render components:

```typescript
export function render(
  elementType: string,
  props: Record<string, any> = {},
  target: blessed.Widgets.Screen | blessed.Widgets.BlessedElement = screen!
): RenderResult {
  // Create the element
  const element = createBlessedElement(elementType, props, target);
  
  // Create a tracker for props
  let currentProps = props;
  
  // Return the result with update and unmount methods
  return {
    element,
    update: (newProps) => {
      Object.assign(currentProps, newProps);
      updateBlessedElement(element, currentProps);
      screen?.render();
    },
    unmount: () => {
      element.destroy();
      screen?.render();
    },
  };
}
```

### Blessed Element Creation

The `createBlessedElement()` function converts SveltUI component props to blessed configuration:

```typescript
export function createBlessedElement(
  elementType: string,
  props: Record<string, any>,
  parent?: blessed.Widgets.BlessedElement
): blessed.Widgets.BlessedElement {
  // Switch based on element type
  switch (elementType.toLowerCase()) {
    case "box":
      // Create a box element
      // ...
    case "text":
      // Create a text element
      // ...
    case "list":
      // Create a list element
      // ...
    // ... other element types ...
  }
  
  // Set up event handlers
  setupEventHandlers(element, props);
  
  return element;
}
```

### Element Updates

The `updateBlessedElement()` function applies changes to blessed elements:

```typescript
export function updateBlessedElement(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  const mappedProps = mapProps(props);
  
  // Apply changes based on property type
  for (const [key, value] of Object.entries(mappedProps)) {
    if (key === "style") {
      // Update style
      // ...
    } else if (key === "content" && "setContent" in element) {
      // Update content
      // ...
    } else if (key === "items" && "setItems" in element) {
      // Update items
      // ...
    }
    // ... handle other property types ...
  }
}
```

## Design Decisions

### Why Manual UI Updates?

SveltUI requires manual UI updates (calling `element.update()` and `screen.render()`) rather than automatically updating the UI when state changes. This decision was made for several reasons:

1. **Performance**: Terminal rendering can be expensive, and automatic updates could lead to too many renders
2. **Control**: Manual updates give developers precise control over when the UI updates
3. **Batching**: Developers can batch multiple updates together before rendering

### Why Svelte 5 Runes?

SveltUI uses Svelte 5 runes for reactivity rather than the traditional Svelte component model for several reasons:

1. **Simplicity**: Runes provide a more direct reactivity model that's easier to understand
2. **Flexibility**: Runes can be used outside of Svelte components, making them more flexible
3. **Future-proof**: Runes are the future direction of Svelte, ensuring SveltUI is aligned with Svelte's roadmap

### Why Blessed?

Blessed was chosen as the terminal rendering library for several reasons:

1. **Maturity**: Blessed is a mature and battle-tested library
2. **Features**: Blessed provides a rich set of features for building terminal UIs
3. **API**: Blessed's API is relatively easy to wrap with a more modern interface

## Implementation Details

### File Extensions

SveltUI uses the `.svelte.ts` extension for files that use Svelte 5 runes. This is necessary because:

1. TypeScript doesn't natively understand runes syntax
2. The `.svelte.ts` extension signals to the build system that these files should be processed by the Svelte compiler before TypeScript

### Build Process

SveltUI uses Vite for building, with plugins for processing Svelte files:

1. The Svelte plugin processes `.svelte` and `.svelte.ts` files
2. Runes are enabled via the `svelte.config.ts` file
3. TypeScript processes all `.ts` files

### Component Structure

SveltUI components use a simplified structure compared to browser-based Svelte:

```svelte
<script lang="ts">
  // Component props with defaults and bindable properties
  let {
    prop1 = $bindable(defaultValue),
    prop2 = defaultValue,
    // ...
  } = $props();
</script>

<!-- No template needed - rendering is handled by SveltUI core -->
```

## Extension Points

SveltUI is designed to be extensible in several ways:

1. **Custom Components**: Developers can create custom components by creating new Svelte components
2. **Custom Element Types**: The `createBlessedElement()` function can be extended to support new element types
3. **Custom Event Handlers**: The event system can be extended to support custom events

## Conclusion

SveltUI's architecture provides a clean bridge between Svelte 5's reactivity and blessed's terminal rendering. By understanding this architecture, developers can effectively use SveltUI to build reactive terminal user interfaces with a component-based approach.