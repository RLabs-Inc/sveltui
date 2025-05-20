# SvelTUI Component Implementation Patterns

This document defines the standard patterns and organization for implementing components in the SvelTUI library. Following these patterns ensures consistency, maintainability, and optimal developer experience.

## Core Philosophy

SvelTUI combines the powerful reactivity system of Svelte 5 with the rich terminal UI capabilities of blessed. Our implementation should:

1. **Leverage Svelte 5's strengths** - Use runes for reactivity and state management
2. **Provide a clean abstraction** - Hide blessed implementation details from component users
3. **Maintain consistent patterns** - Each component should follow the same implementation structure
4. **Optimize for developer experience** - Make components intuitive and easy to use
5. **Support theming and customization** - Every component should work seamlessly with the theming system

## File Organization

```
src/
├── components/  (Svelte component interfaces with public APIs)
│   ├── Box.svelte
│   ├── Text.svelte
│   ├── Input.svelte
│   ├── Checkbox.svelte
│   └── Select.svelte
├── core/
│   ├── renderer.svelte.ts  (Screen initialization and rendering)
│   ├── reconciler.svelte.ts  (Component reconciliation)
│   ├── registry.svelte.ts  (Component registration)
│   ├── blessed-utils.svelte.ts  (Shared blessed utilities)
│   ├── theme.ts  (Theme definitions)
│   ├── theme-manager.ts  (Theme loading and application)
│   ├── types.ts  (Shared type definitions)
│   └── adapters/  (Blessed implementation adapters)
│       ├── base-adapter.svelte.ts  (Shared adapter functionality)
│       ├── display/  (Display components)
│       │   ├── box-adapter.svelte.ts
│       │   └── text-adapter.svelte.ts
│       ├── input/  (Form input components)
│       │   ├── input-base-adapter.svelte.ts  (Shared input functionality)
│       │   ├── input-adapter.svelte.ts
│       │   ├── checkbox-adapter.svelte.ts
│       │   └── select-adapter.svelte.ts
│       └── container/  (Container components)
│           └── list-adapter.svelte.ts
```

## Component Implementation Pattern

Each component in SvelTUI follows a consistent three-part implementation pattern:

### 1. Svelte Component Interface (`.svelte` file)

This defines the public API using Svelte 5's runes and serves as the component interface.

```svelte
<script lang="ts">
  // Import types but NOT blessed-specific code
  import type { ComponentProps } from '../core/types';

  // Component properties with defaults and bindable props
  let {
    // Public properties that can be bound
    value = $bindable(''),

    // Option props with defaults
    width = '50%',

    // Event handlers
    onChange = undefined as ((value: string) => void) | undefined,
  } = $props();

  // Local reactive state
  let isFocused = $state(false);

  // Derived values
  let displayValue = $derived(`Value: ${value}`);

  // Handle component-specific logic
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
</script>

<!-- No template needed - our renderer handles this -->
```

### 2. Adapter Implementation (`.svelte.ts` file)

This bridges between the Svelte component and blessed, containing all blessed-specific implementation details and leveraging Svelte 5's reactivity system.

```typescript
// checkbox-adapter.svelte.ts
import * as blessed from "blessed";
import { getTheme } from "../theme-manager";

// Utilities for creating blessed elements
export function createCheckboxElement(
  props: Record<string, any>,
  parent?: blessed.Widgets.Node
): blessed.Widgets.BlessedElement {
  // Create the blessed element
  const element = blessed.text({
    ...props,
    parent,
    tags: true,
    focusable: true,
    input: true,
    keys: true,
    vi: true,
    mouse: true,
  });

  // Set up event handlers
  setupCheckboxEvents(element, props);

  // Initial display update
  updateCheckboxDisplay(element, props);

  return element;
}

// Event setup function
function setupCheckboxEvents(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
) {
  // Set up key events
  element.on("keypress", (ch, key) => {
    if (!key) return;

    const keyName = key.name || "";

    // Skip tab handling
    if (keyName === "tab") return;

    // Check for handler
    if (
      props.handleKeyNavigation &&
      typeof props.handleKeyNavigation === "function"
    ) {
      if (props.handleKeyNavigation(keyName)) {
        updateCheckboxDisplay(element, props);
        element.screen.render();
      }
    } else {
      // Default handling for space/enter/return
      if (["enter", "return", "space"].includes(keyName)) {
        toggleCheckbox(props);
        updateCheckboxDisplay(element, props);
        element.screen.render();
      }
    }
  });

  // More event handlers as needed...
}

// Update display
export function updateCheckboxDisplay(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
) {
  // Implementation of display update logic
}

// More helper functions as needed...
```

### 3. Registry Component Definition

This connects the component to the SvelTUI registry, making it available for use.

```typescript
// In registry.svelte.ts

import {
  createCheckboxElement,
  updateCheckboxDisplay,
} from "./adapters/input/checkbox-adapter.svelte";

// Register Checkbox component
registerComponent("checkbox", {
  create: (props, parent) => createCheckboxElement(props, parent),
  update: (element, props) => {
    // Update display
    updateCheckboxDisplay(element, props);

    // Update other properties
    for (const [key, value] of Object.entries(props)) {
      if (!CHECKBOX_SPECIAL_PROPS.includes(key)) {
        (element as any)[key] = value;
      }
    }
  },
  defaultProps: {
    checked: false,
    indeterminate: false,
    disabled: false,
    width: "100%",
    height: 1,
  },
});
```

## Component Property Patterns

Components should follow these property patterns:

1. **$bindable Properties** - Any property that should be bindable by users should use $bindable
2. **Event Handlers** - Should use the `onEvent` naming pattern
3. **Style Properties** - Consistent style properties across components
4. **Theming** - Use theme colors for styling elements

## Component Category Structure

Components should be organized by category:

1. **Display Components** - Static display elements (Box, Text)
2. **Input Components** - Interactive form elements (Input, Checkbox, Select)
3. **Container Components** - Components that hold other components (List)
4. **Layout Components** - Components for organizing UI layout (Grid, Stack)

## Code Style Guidelines

1. **TypeScript** - Use proper types for all components
2. **Svelte Runes** - Leverage Svelte 5's reactivity system
3. **Comments** - Document complex logic and component usage
4. **Error Handling** - Gracefully handle errors and edge cases
5. **Performance** - Optimize for terminal performance

## Testing Strategy

1. **Unit Tests** - Test component logic in isolation
2. **Integration Tests** - Test components in composition
3. **Visual Tests** - Verify component appearance in terminal

## Accessibility Considerations

1. **Keyboard Navigation** - All components should support keyboard navigation
2. **Screen Reader Compatibility** - Support accessibility features where possible

## Documentation Standards

Each component should include:

1. **Usage Examples** - Clear examples of how to use the component
2. **API Reference** - Detailed property and event documentation
3. **Advanced Patterns** - Document complex usage patterns

By following these patterns, SvelTUI will maintain a consistent, maintainable, and developer-friendly component ecosystem.
