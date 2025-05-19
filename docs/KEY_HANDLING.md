# SveltUI Keyboard Handling

This document explains the recommended keyboard handling patterns in SveltUI applications.

## Core Principles

SveltUI's keyboard handling follows these core principles:

1. **Leverage Blessed's Native Capabilities**: Use blessed's built-in focus and key handling systems rather than creating parallel systems.
2. **Component-Level Key Handling**: Handle keys at the component level where possible.
3. **Application-Level Navigation**: Handle tab navigation and global shortcuts at the application level.
4. **Consistency**: Provide consistent patterns that match user expectations.

## Key Handling Utilities

SveltUI provides several utility functions to simplify keyboard handling:

### `setupTabNavigation(screen, elements)`

Sets up tab navigation between a set of elements:

```typescript
import { setupTabNavigation } from 'sveltui';

// Define tab order
const focusableElements = [
  inputElement.element,
  checkboxElement.element,
  buttonElement.element
];

// Set up tab navigation
const cleanupTabNav = setupTabNavigation(screen, focusableElements);

// Later, when cleaning up:
cleanupTabNav();
```

### `setupExitKeys(screen, callback)`

Sets up standard exit keys (q, Ctrl+C) for the application:

```typescript
import { setupExitKeys } from 'sveltui';

// Set up exit keys
const cleanupExitKeys = setupExitKeys(screen, () => {
  // Optional cleanup before exit
  saveData();
});

// Later, when cleaning up (though rarely needed):
cleanupExitKeys();
```

### `setupInputHandling(inputElement, options)`

Configures input elements with proper escape/submit handling:

```typescript
import { setupInputHandling } from 'sveltui';

// Set up input handling
const cleanupInput = setupInputHandling(inputElement.element, {
  onEscape: () => {
    // Focus a different element when escape is pressed
    listElement.element.focus();
    screen.render();
  },
  onSubmit: (value) => {
    // Handle submitted value
    console.log(`Submitted: ${value}`);
  }
});

// Later, when cleaning up:
cleanupInput();
```

### `focusFirst(elements)`

Helper to focus the first element in a group:

```typescript
import { focusFirst } from 'sveltui';

// Focus the first element
focusFirst([
  inputElement.element,
  checkboxElement.element,
  buttonElement.element
]);
```

### `safeToString(value)`

Helper for safely converting values (including objects) to strings:

```typescript
import { safeToString } from 'sveltui';

// Safely convert a value to string
const displayValue = safeToString(complexObject);
```

## Component-Specific Key Handling

### Input Components

Input components handle their own key events:

- Tab/Shift+Tab: Moves focus (handled by `setupTabNavigation`)
- Enter: Submits the input
- Escape: Exits input mode

```typescript
const inputElement = render("input", {
  value: inputValue,
  onChange: (value) => {
    inputValue = value;
  }
});

setupInputHandling(inputElement.element, {
  onEscape: () => nextElement.element.focus(),
  onSubmit: (value) => console.log(`Submitted: ${value}`)
});
```

### Checkbox Components

Checkbox components handle Space/Enter for toggling:

```typescript
const checkboxElement = render("checkbox", {
  checked: isChecked,
  onChange: (checked) => {
    isChecked = checked;
  }
});

// Key handling is built into the checkbox adapter
```

### List Components

List components handle their own navigation:

```typescript
const listElement = render("list", {
  items: ["Item 1", "Item 2", "Item 3"],
  selected: selectedIndex,
  onSelect: (index, item) => {
    selectedIndex = index;
    console.log(`Selected: ${item}`);
  }
});

// Arrow key navigation is built into the list adapter
```

## Application Focus Management

Tab navigation is handled at the application level:

```typescript
// Application code
function setupKeyHandling() {
  // Define tab order
  const focusableElements = [
    inputElement.element,
    checkboxElement.element,
    buttonElement.element,
    listElement.element
  ];
  
  // Set up tab navigation
  setupTabNavigation(screen, focusableElements);
  
  // Set up exit keys
  setupExitKeys(screen);
  
  // Set up input handling
  setupInputHandling(inputElement.element, {
    onEscape: () => checkboxElement.element.focus()
  });
  
  // Set initial focus
  focusFirst(focusableElements);
}
```

## Custom Key Handlers

You can add custom key handlers for specific components:

```typescript
// Component-specific handlers
listElement.element.key(['a'], () => {
  // Select all items
  console.log('Select all');
});

// Global key handlers
screen.key(['?'], () => {
  // Show help
  showHelpBox();
});
```

## Key Handling Best Practices

1. **Define Clear Tab Order**: Always define a clear tab order for your application.

2. **Handle Escape Consistently**: Escape should generally exit the current mode or focus.

3. **Provide Feedback**: Give visual feedback when keys are pressed.

4. **Document Shortcuts**: Make keyboard shortcuts discoverable for users.

5. **Test Keyboard Navigation**: Ensure your application works well with keyboard-only usage.

6. **Avoid Component Focus Traps**: Always provide a way to move focus away from components.

## Key Behavior by Component Type

| Component | Key | Behavior |
|-----------|-----|----------|
| Input | Tab | Move to next element |
| | Shift+Tab | Move to previous element |
| | Enter | Submit value |
| | Escape | Exit input mode |
| | Characters | Text input |
| Checkbox | Tab | Move to next element |
| | Shift+Tab | Move to previous element |
| | Space/Enter | Toggle state |
| List | Tab | Move to next element |
| | Shift+Tab | Move to previous element |
| | Up/Down | Navigate items |
| | Enter | Select current item |
| Button | Tab | Move to next element |
| | Shift+Tab | Move to previous element |
| | Space/Enter | Activate button |

## Example Application

See the `examples/keyboard-demo.svelte.ts` file for a complete example showing proper keyboard handling in a SveltUI application.