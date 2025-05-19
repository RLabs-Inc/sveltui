# Blessed Events and Key Handling

This document explains how keyboard and mouse events work in the blessed library, which is the foundation for SveltUI.

## Key Events in Blessed

There are several ways to handle keyboard events in blessed:

### 1. Element-level Key Events

Elements can handle key events directly if they are focusable:

```javascript
element.key("enter", function (ch, key) {
  // Handle enter key
});
```

This binds a handler for the 'enter' key specifically to the element. The handler is only called when the element is focused.

### 2. Global Key Events

Screen-level key handlers can be registered for specific keys:

```javascript
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});
```

These handlers are always active, regardless of which element is focused.

### 3. Keypress Events

The most general form of key event handling:

```javascript
screen.on("keypress", function (ch, key) {
  // Handle all key events
  // ch is the character, key is an object with: { name, ctrl, meta, shift }
});

// Or at element level:
element.on("keypress", function (ch, key) {
  // Handle key events when this element is focused
});
```

## Input Elements in Blessed

Blessed has several types of input elements that handle keys differently:

### Input/Textbox

Handles all input keys internally for text entry. Your application should:

- Set `inputOnFocus: true` to automatically begin accepting input
- Listen for 'submit' events (triggered by Enter)
- Use `input.setValue()` and `input.getValue()` methods

### List

Handles up/down navigation internally. Your application should:

- Listen for 'select' events
- Set items using `list.setItems()`
- Control selection with `list.select()`

### Checkbox

Requires manual key handling:

- Bind 'space' and 'enter' keys to toggle the checkbox
- Use `check()`, `uncheck()`, or `toggle()` methods
- Listen for 'check' and 'uncheck' events

### Form Elements

Form elements work together for navigation:

- Tab key moves between elements (handled automatically in forms)
- Enter key submits the form
- Escape key cancels the form

## Focus Management

Focus management is critical for keyboard navigation:

### Focus Events

```javascript
element.on("focus", function () {
  // Element received focus
});

element.on("blur", function () {
  // Element lost focus
});
```

### Focus Methods

```javascript
element.focus(); // Give focus to an element
screen.focused; // Get the currently focused element
```

### Tab Navigation

For implementing tab navigation between elements:

```javascript
screen.key("tab", function () {
  focusNext();
});

screen.key("S-tab", function () {
  focusPrevious();
});
```

## Event Bubbling

Blessed supports event bubbling up the element tree:

```javascript
// Listen for click events on any child element
box.on("element click", function (el, mouse) {
  // el is the element that was clicked
  // You can check if el is a specific child
  if (el === childElement) {
    // Do something
  }

  // Return false to stop propagation
  return false;
});
```

## Best Practices for SveltUI Components

### Self-Handling Components

Input and List components should:

- Register internal keypress handlers
- Handle their own state changes
- Emit high-level events (onChange, onSelect)

### External-Handling Components

Checkbox and Select components should:

- Be designed to work with external key handlers
- Expose methods to change their state
- Clearly document required key bindings

### Application-Level Event Handling

For consistent keyboard navigation:

1. Register global key handlers for tab navigation
2. Check the currently focused element before handling specific keys
3. Always call screen.render() after state changes
4. Use event bubbling for group event handling

## Additional Resources

- Blessed supports many keyboard events including modifiers (Ctrl, Shift, etc.)
- Special key names: 'up', 'down', 'left', 'right', 'escape', 'return', etc.
- For a complete list of key names, see the [blessed key event documentation](https://github.com/chjj/blessed#screen-from-node)
