# SveltUI Component Best Practices

This document outlines best practices for working with SveltUI components, with a focus on keyboard navigation and interaction patterns.

## Keyboard Navigation

### Tab Navigation

Tab navigation between components should be handled at the application level, not within individual components. This allows for a consistent navigation experience across different screen layouts.

```typescript
// Example tab navigation implementation
let focusIndex = $state(0);
const focusElements = [
  component1.element,
  component2.element,
  component3.element
];

function updateFocus() {
  // Make sure index is in bounds
  if (focusIndex < 0) focusIndex = focusElements.length - 1;
  if (focusIndex >= focusElements.length) focusIndex = 0;
  
  // Focus the current element
  focusElements[focusIndex].focus();
  screen.render();
}

// Handle tab key for forward navigation
screen.key(['tab'], () => {
  focusIndex++;
  updateFocus();
});

// Handle shift+tab for backward navigation
screen.key(['S-tab'], () => {
  focusIndex--;
  updateFocus();
});
```

### Component-Specific Key Handling

For component-specific key actions (like toggling a checkbox or navigating a dropdown), let the component handle these internally. Each component has built-in key handling through its adapter.

Components provide these key handling functions:
- `handleKeyNavigation`: For handling specific keys like Enter, Space, Arrow keys
- `handleFocus` and `handleBlur`: For focus and blur events

```typescript
// Example checkbox with key handling
const checkbox = render("checkbox", {
  checked: $bindable(false),
  onChange: (checked) => {
    console.log(`Checkbox is now ${checked ? 'checked' : 'unchecked'}`);
  },
  handleFocus: () => {
    console.log('Checkbox is focused');
  },
  handleBlur: () => {
    console.log('Checkbox lost focus');
  }
});
```

## Interactive Components

### Checkboxes

Checkboxes can be in three states: `checked`, `unchecked`, and `indeterminate`. The indeterminate state is useful for representing partial selections.

```typescript
// Example checkbox with indeterminate state
const checkbox = render("checkbox", {
  checked: false,
  indeterminate: true,
  label: "Select All",
  onChange: (checked) => {
    // Indeterminate gets cleared when toggled
    checkbox.update({ 
      checked: checked,
      indeterminate: false
    });
  }
});
```

Key events handled by checkboxes:
- `Space`, `Enter`, `Return`: Toggle the checkbox state

### Select Dropdowns

Select components handle their own dropdown state and navigation. The application should focus the select, but the select manages the dropdown.

```typescript
// Example select component
const select = render("select", {
  options: ["Option 1", "Option 2", "Option 3"],
  value: $bindable(""),
  placeholder: "Select an option...",
  onChange: (value) => {
    console.log(`Selected: ${value}`);
  },
  onOpen: () => {
    console.log("Dropdown opened");
  },
  onClose: () => {
    console.log("Dropdown closed");
  }
});
```

Key events handled by selects:
- `Space`, `Enter`, `Return`: Open/close the dropdown
- `Up`, `Down`: Navigate through options when dropdown is open
- `Escape`: Close the dropdown
- First letter navigation: Type a character to jump to options starting with that character

## Focus Management

Focus management is critical for keyboard navigation. Always call `screen.render()` after focus changes to ensure the UI updates correctly.

```typescript
// Focus management best practices

// 1. Set initial focus on component load
myComponent.element.focus();
screen.render();

// 2. Use element focus event to track focus changes
screen.on('element focus', (element) => {
  console.log('Focus changed to:', element.type);
});

// 3. Update focused state in components
const button = render("box", {
  handleFocus: () => {
    button.update({
      style: {
        bg: "blue",
        fg: "white"
      }
    });
    screen.render();
  },
  handleBlur: () => {
    button.update({
      style: {
        bg: "",
        fg: ""
      }
    });
    screen.render();
  }
});
```

## Debugging Focus Issues

If components are not receiving keyboard events properly, check the following:

1. Ensure the component has `focusable: true` (set automatically by the base adapter)
2. Verify the component is properly focused using `screen.focused === component.element`
3. Use a debug display to show the currently focused element
4. Check that `screen.render()` is called after focus changes

Example debug helper:

```typescript
// Debug focus display
const debugText = render("text", {
  content: "No element focused"
});

screen.on('element focus', (element) => {
  debugText.update({
    content: `Focused: ${element.type}`
  });
  screen.render();
});
```

## Demo Examples

SveltUI provides focused demo files for each component type:

- `bun run checkbox-demo`: Demonstrates the Checkbox component
- `bun run select-demo`: Demonstrates the Select component
- `bun run components-demo`: Comprehensive demo of all components

Study these demos to understand best practices for component interactions.