# Component Implementation Strategy

This document outlines the strategy for implementing components in SvelTUI, a terminal UI framework that uses Svelte 5 as its core. It provides guidelines for creating efficient, reusable, and maintainable terminal UI components.

## Core Principles

1. **Svelte-First**: Components should leverage Svelte 5's reactivity and component model.
2. **Terminal-Aware**: Components should be optimized for terminal rendering.
3. **Flexible**: Components should be adaptable to different use cases.
4. **Performant**: Components should minimize terminal redraws.
5. **Theme-Compatible**: Components should respect the theming system.

## Component Structure

### Basic Structure

SvelTUI components typically follow this structure:

```svelte
<script>
  // 1. Import dependencies
  import { getTheme } from '../theme/currentTheme.svelte';
  
  // 2. Define component properties
  let { 
    width = '100%',
    height = 'shrink',
    border = false,
    label = undefined,
    // Other properties...
  } = $props();
  
  // 3. Set up internal state
  let focused = $state(false);
  
  // 4. Access theme
  const theme = getTheme();
  
  // 5. Define event handlers
  function handleFocus() {
    focused = true;
  }
  
  function handleBlur() {
    focused = false;
  }
</script>

<!-- 6. Component markup -->
<box 
  border={border}
  label={label}
  width={width}
  height={height}
  style={{
    bg: focused ? theme.colors.focusBg : theme.colors.bg,
    fg: theme.colors.fg,
    border: {
      fg: theme.colors.border
    }
  }}
  on:focus={handleFocus}
  on:blur={handleBlur}
>
  <!-- 7. Component content (slots) -->
  <slot />
</box>
```

### Terminal Elements

SvelTUI provides several terminal-specific elements that map directly to terminal UI primitives:

- `<box>`: A container element (like a div)
- `<text>`: A text display element
- `<list>`: An interactive list element
- `<input>`: A text input element
- `<checkbox>`: A checkbox element
- `<button>`: A button element
- `<progress>`: A progress bar element

## Props and Events

### Props

Define props using Svelte 5's `$props()` rune:

```svelte
<script>
  let {
    // Props with default values
    width = '100%',
    height = 'shrink',
    border = false,
    focusable = true,
    // Required props (no default)
    items,
  } = $props();
</script>
```

### Events

Listen for terminal events using the standard Svelte event syntax:

```svelte
<box
  on:focus={handleFocus}
  on:blur={handleBlur}
  on:keypress={handleKeypress}
/>
```

Dispatch custom events using Svelte's `createEventDispatcher`:

```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function handleSelect(item, index) {
    dispatch('select', { item, index });
  }
</script>
```

## Styling Components

### Theme Integration

Components should use the theme system for consistent styling:

```svelte
<script>
  import { getTheme } from '../theme/currentTheme.svelte';
  const theme = getTheme();
</script>

<box
  style={{
    bg: theme.colors.bg,
    fg: theme.colors.fg,
    border: {
      fg: theme.colors.border
    }
  }}
/>
```

### Inline Styles

Components can use inline styles for dynamic styling:

```svelte
<box
  style={{
    bg: focused ? theme.colors.focusBg : theme.colors.bg,
    fg: selected ? theme.colors.selectedFg : theme.colors.fg,
    bold: selected,
    underline: focused
  }}
/>
```

### Style Props

Expose style-related props to allow customization:

```svelte
<script>
  let {
    bg = undefined,
    fg = undefined,
    borderColor = undefined,
    style = {}
  } = $props();
  
  // Merge inline styles with theme and props
  $derived computedStyle = {
    ...theme.getElementStyle('box'),
    bg: bg || theme.colors.bg,
    fg: fg || theme.colors.fg,
    border: {
      fg: borderColor || theme.colors.border
    },
    ...style
  };
</script>

<box style={computedStyle} />
```

## Layout Handling

### Basic Layout

Components should support standard layout properties:

```svelte
<box
  width={width}
  height={height}
  top={top}
  left={left}
  right={right}
  bottom={bottom}
/>
```

### Flex Layout

SvelTUI supports flexbox-like layouts:

```svelte
<box
  direction="row"
  justify="space-between"
  align="center"
  wrap={true}
/>
```

### Yoga Integration

For more complex layouts, use Yoga integration:

```svelte
<script>
  import { applyYogaLayout } from '../layout/yoga';
  
  let {
    flexDirection = 'row',
    justifyContent = 'flex-start',
    alignItems = 'stretch',
    flexWrap = 'nowrap',
    children = []
  } = $props();
  
  // Apply Yoga layout
  $derived layout = applyYogaLayout({
    flexDirection,
    justifyContent,
    alignItems,
    flexWrap,
    children
  });
</script>

<box
  layout={layout}
>
  <slot />
</box>
```

## State Management

### Local State

Use Svelte 5's `$state` rune for local component state:

```svelte
<script>
  let selected = $state(0);
  let focused = $state(false);
  let inputValue = $state('');
</script>
```

### Derived State

Use Svelte 5's `$derived` rune for computed values:

```svelte
<script>
  let { items = [] } = $props();
  let selected = $state(0);
  
  $derived selectedItem = items[selected];
  $derived hasItems = items.length > 0;
  $derived isEmpty = items.length === 0;
</script>
```

### Effects

Use Svelte 5's `$effect` rune for side effects:

```svelte
<script>
  let { items = [] } = $props();
  let selected = $state(0);
  
  // Reset selection when items change
  $effect(() => {
    if (selected >= items.length) {
      selected = Math.max(0, items.length - 1);
    }
  });
</script>
```

## Event Handling

### Keyboard Events

Handle keyboard events using the `on:keypress` directive:

```svelte
<script>
  function handleKeypress(event) {
    if (event.key === 'enter') {
      // Handle Enter key
    } else if (event.key === 'up') {
      // Handle Up Arrow key
    }
  }
</script>

<box on:keypress={handleKeypress} />
```

### Mouse Events

Handle mouse events using the appropriate directives:

```svelte
<box
  on:click={handleClick}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
/>
```

### Focus Management

Manage focus with focus-related events:

```svelte
<box
  focusable={true}
  on:focus={handleFocus}
  on:blur={handleBlur}
/>
```

## Composing Components

### Using Built-in Components

Compose complex components using built-in components:

```svelte
<box border>
  <text>{title}</text>
  <list items={items} on:select={handleSelect} />
  <box direction="row" justify="flex-end">
    <button on:click={onCancel}>Cancel</button>
    <button on:click={onSubmit}>Submit</button>
  </box>
</box>
```

### Component Slots

Use slots to allow content injection:

```svelte
<box>
  <slot name="header" />
  <div class="content">
    <slot />
  </div>
  <slot name="footer" />
</box>
```

### Component Composition

Create higher-order components by composing simpler ones:

```svelte
<script>
  import { Box, Text, List, Button } from '../components/ui';
  
  let { title, items, onSubmit, onCancel } = $props();
  let selected = $state(0);
  
  function handleSelect(event) {
    selected = event.detail.index;
  }
</script>

<Box border>
  <Text bold>{title}</Text>
  <List 
    items={items} 
    selected={selected}
    on:select={handleSelect} 
  />
  <Box direction="row" justify="flex-end">
    <Button on:click={onCancel}>Cancel</Button>
    <Button on:click={onSubmit}>Submit</Button>
  </Box>
</Box>
```

## Best Practices

1. **Keep Components Focused**: Each component should have a single responsibility.
2. **Use Terminal Elements**: Use the provided terminal elements instead of HTML elements.
3. **Use the Theme System**: Leverage the theme system for consistent styling.
4. **Batch Updates**: Minimize terminal redraws by batching updates.
5. **Handle Terminal Events**: Use the provided event system for terminal events.
6. **Provide Sensible Defaults**: Components should work well with minimal configuration.
7. **Allow Customization**: Expose props for customization when needed.
8. **Use Svelte 5 Features**: Leverage Svelte 5's reactivity and component model.
9. **Document Components**: Provide clear documentation for each component.
10. **Test Components**: Write tests for component behavior.

## Implementation Details

### DOM-to-Terminal Binding

Components work with the DOM-to-terminal binding system:

1. Svelte creates DOM nodes via the runtime DOM connector
2. DOM nodes are connected to terminal elements via bidirectional binding
3. Terminal elements are rendered to the terminal via blessed
4. Updates flow from Svelte to DOM to terminal elements to blessed

### Reconciliation

Components leverage the reconciler for efficient updates:

1. DOM operations are intercepted by the runtime connector
2. Operations are queued in the reconciler
3. Reconciler processes operations in batches for efficiency
4. Only necessary changes are applied to the terminal

### Event Propagation

Events flow from the terminal to components:

1. Terminal events are generated by blessed
2. Events are mapped to DOM-like events
3. Events are dispatched to the appropriate components
4. Components handle events via Svelte event handlers

## Examples

### Simple Text Input

```svelte
<script>
  import { getTheme } from '../theme/currentTheme.svelte';
  
  let {
    value = '',
    placeholder = '',
    width = 20,
    height = 1,
    secret = false,
  } = $props();
  
  let focused = $state(false);
  const theme = getTheme();
  
  function handleFocus() {
    focused = true;
  }
  
  function handleBlur() {
    focused = false;
  }
  
  function handleInput(event) {
    value = event.detail.value;
  }
</script>

<input
  value={value}
  placeholder={placeholder}
  width={width}
  height={height}
  secret={secret}
  border={true}
  style={{
    bg: focused ? theme.colors.focusBg : theme.colors.bg,
    fg: theme.colors.fg,
    border: {
      fg: focused ? theme.colors.focusBorder : theme.colors.border
    }
  }}
  on:focus={handleFocus}
  on:blur={handleBlur}
  on:input={handleInput}
/>
```

### Interactive List

```svelte
<script>
  import { getTheme } from '../theme/currentTheme.svelte';
  import { createEventDispatcher } from 'svelte';
  
  let {
    items = [],
    selected = 0,
    width = '100%',
    height = 'shrink',
    border = true,
  } = $props();
  
  let focused = $state(false);
  const theme = getTheme();
  const dispatch = createEventDispatcher();
  
  function handleFocus() {
    focused = true;
  }
  
  function handleBlur() {
    focused = false;
  }
  
  function handleSelect(index) {
    selected = index;
    dispatch('select', { index, item: items[index] });
  }
  
  function handleKeypress(event) {
    if (event.key === 'up' && selected > 0) {
      handleSelect(selected - 1);
    } else if (event.key === 'down' && selected < items.length - 1) {
      handleSelect(selected + 1);
    } else if (event.key === 'enter') {
      dispatch('action', { index: selected, item: items[selected] });
    }
  }
</script>

<list
  items={items}
  selected={selected}
  width={width}
  height={height}
  border={border}
  keys={true}
  mouse={true}
  style={{
    bg: theme.colors.bg,
    fg: theme.colors.fg,
    selected: {
      bg: theme.colors.selectedBg,
      fg: theme.colors.selectedFg
    },
    border: {
      fg: focused ? theme.colors.focusBorder : theme.colors.border
    }
  }}
  on:focus={handleFocus}
  on:blur={handleBlur}
  on:select={(event) => handleSelect(event.detail.index)}
  on:keypress={handleKeypress}
/>
```

## Terminal-Specific Considerations

### Limited Color Support

Terminal environments have limited color support:

```svelte
<!-- Use terminal-compatible colors -->
<text style={{ fg: 'blue', bg: 'white' }}>Limited colors</text>

<!-- Use theme system for consistent colors -->
<text style={{ fg: theme.colors.primary }}>Theme colors</text>
```

### Character-Based Rendering

Remember that terminals render characters, not pixels:

```svelte
<!-- Use characters for UI elements -->
<text content="─────────────" /> <!-- Horizontal line -->
<text content="│" /> <!-- Vertical line -->
<text content="┌───┐" /> <!-- Box corners -->
```

### Focus and Navigation

Terminals need explicit focus management:

```svelte
<script>
  // Trap focus within a modal
  function handleKeypress(event) {
    if (event.key === 'tab') {
      // Handle tabbing between focusable elements
      focusNextElement();
      event.preventDefault();
    }
  }
</script>
```

## Conclusion

Building effective components in SvelTUI requires understanding both Svelte 5's component model and the constraints of terminal rendering. By following these guidelines, you can create components that are efficient, reusable, and maintainable.