# SveltUI Keyboard Handling System

## Overview

The SveltUI keyboard handling system provides a standardized way to handle keyboard events in terminal user interfaces built with SveltUI. The system is designed to be intuitive, consistent, and flexible, supporting both common keyboard patterns and custom key bindings.

## Core Components

The keyboard handling system consists of:

1. **Key Handler Manager**: A central utility that manages all keyboard events
2. **Focus Management**: Automatic tab navigation between interactive elements
3. **Component-Specific Key Handlers**: Pre-defined key bindings for UI components
4. **Custom Key Bindings**: Ability to override default key behavior

## Standard Navigation Keys

SveltUI provides consistent keyboard navigation across all applications:

| Key | Action |
|-----|--------|
| `Tab` | Move focus to the next interactive element |
| `Shift+Tab` | Move focus to the previous interactive element |
| `Enter` / `Space` | Activate the focused element (click buttons, toggle checkboxes, etc.) |
| `Escape` | Exit from the current input mode or close dialogs |
| `Arrow Keys` | Navigate within components (list items, select options) |

## Component Categories

SveltUI components are divided into two categories based on how they handle keyboard events:

### Self-Handling Components

Components that internally handle their own keyboard events:

| Component | Key Bindings |
|-----------|-------------|
| `Input` | - Character keys: Text input<br>- Arrow keys: Move cursor<br>- Enter: Submit<br>- Escape: Exit input mode |
| `List` | - Up/Down arrows: Navigate items<br>- Enter: Select item<br>- Home/End: Jump to first/last item |

### External-Handling Components

Components that require key handlers to be registered:

| Component | Key Bindings |
|-----------|-------------|
| `Checkbox` | - Space/Enter: Toggle state |
| `Select` | - Space/Enter: Open/close dropdown<br>- Up/Down arrows: Navigate options when open |
| `Button` | - Space/Enter: Activate button |

## Using the Key Handler System

### Tab Navigation and Focus Management

Focus management is handled automatically by the SveltUI renderer. Elements with the `focusable` property are included in the tab navigation order.

You can control the tab order using the `tabIndex` property:

```typescript
// First element in tab order
const firstElement = render("input", {
  tabIndex: 0,
  // ...other props
});

// Second element in tab order
const secondElement = render("checkbox", {
  tabIndex: 1,
  // ...other props
});

// Element not in tab order (but still focusable programmatically)
const nonTabbableElement = render("button", {
  tabIndex: -1,
  // ...other props
});
```

### Registering Global Key Handlers

You can register global key handlers for application-wide keyboard shortcuts:

```typescript
import { registerGlobalKeyHandler } from "sveltui";

// Register a key handler for Ctrl+S to save
registerGlobalKeyHandler("ctrl-s", (ch, key, element) => {
  saveDocument();
  return false; // Prevent further processing
});

// Register multiple keys for the same action
registerGlobalKeyHandler(["q", "escape", "ctrl-c"], (ch, key, element) => {
  process.exit(0);
  return false;
});
```

### Component-Specific Key Handling

Components have their own key handlers, but you can customize them:

```typescript
// Custom key handler for a checkbox
const checkbox = render("checkbox", {
  checked: isChecked,
  handleKeyNavigation: (key) => {
    if (key === "space") {
      // Custom space key behavior
      return true; // Return true to indicate the key was handled
    }
    return false; // Return false for default handling
  }
});
```

### Moving Focus Programmatically

You can programmatically move focus between elements:

```typescript
import { moveFocus } from "sveltui";

// Move to next focusable element
moveFocus(screen, "next");

// Move to previous focusable element
moveFocus(screen, "prev");

// Focus a specific index
moveFocus(screen, 2); // Focus the third element in the tab order
```

## Internal Architecture

The keyboard handling system uses the following design:

1. **Key Event Registration**: Central registry for all key handlers
2. **Event Bubbling**: Key events are processed in order:
   - Component-specific handlers first
   - Global handlers next
3. **Focus Management**: Integrated with the renderer to track focusable elements
4. **Propagation Control**: Handlers can stop event propagation by returning `false`

## Best Practices

1. **Be Consistent**: Follow standard keyboard conventions (Tab for navigation, Enter/Space for activation)
2. **Provide Feedback**: Update the UI when keyboard actions are performed
3. **Avoid Conflicts**: Don't use the same key for multiple actions in the same context
4. **Support Navigation**: Ensure all interactive elements are keyboard-accessible
5. **Document Key Bindings**: Provide help text or key binding hints for users

## Component-Specific Guidelines

### Button Components

- Activate with `Enter` and `Space`
- Always provide a clear focus indicator
- Support custom key activation through `handleKeyNavigation` prop

### Form Components

- Support `Tab` navigation between fields
- Support `Enter` to submit the form
- Allow `Escape` to reset or cancel input
- For fields with multiple options (dropdowns, radios), support arrow key navigation

### List Components

- Support arrow keys for navigation
- Support `Home` and `End` for jumping to first/last items
- Support `Enter` for selection
- Consider supporting letter keys for jumping to items that start with that letter

### Checkbox and Toggle Components

- Support toggling with `Space` and `Enter`
- Provide clear visual feedback for focus and selected state
- Support custom toggle keys through `handleKeyNavigation` prop

## Advanced Usage

### Key Priorities

Key handlers can have priorities to determine processing order:

```typescript
// Higher priority handler (executed first)
registerGlobalKeyHandler("ctrl-s", saveHandler, 10);

// Lower priority handler (executed if higher priority doesn't stop propagation)
registerGlobalKeyHandler("ctrl-s", backupHandler, 5);
```

### Conditional Key Handling

You can implement conditional key handling based on application state:

```typescript
registerGlobalKeyHandler("a", (ch, key, element) => {
  if (appMode === "edit") {
    // Handle "a" key in edit mode
    return false;
  }
  // Allow "a" key to propagate in other modes
});
```

### Modal Key Handling

For modal dialogs or popups, you can temporarily override key handlers:

```typescript
function openModal() {
  // Register modal-specific key handlers with high priority
  const escapeHandler = (ch, key) => {
    closeModal();
    return false;
  };
  
  registerGlobalKeyHandler("escape", escapeHandler, 100);
  
  // Return function to clean up on close
  return () => {
    unregisterGlobalKeyHandler("escape", escapeHandler);
  };
}

// Usage
const closeHandlers = openModal();
// Later...
closeHandlers();
```

## Conclusion

The SveltUI keyboard handling system provides a consistent, accessible way to implement keyboard navigation and shortcuts in terminal applications. By following these patterns, developers can create applications that are intuitive and efficient for keyboard users.