# SvelTUI Test Examples

This directory contains clean, working test examples for SvelTUI components.

## Available Examples

### 1. Basic Test (`basic-test.svelte`)
The simplest possible example showing a Box with Text components.

**Run it:**
```bash
bun --conditions browser examples/basic-test-launcher.ts
```

**What it demonstrates:**
- Basic Box component with border and label
- Text components with different colors
- Component mounting and rendering

### 2. TextInput Test (`text-input-test.svelte`)
Tests the TextInput component for user input.

**Run it:**
```bash
bun --conditions browser examples/text-input-test-launcher.ts
```

**What it demonstrates:**
- TextInput component with focus
- Real-time value binding
- Submit event handling
- Dynamic content updates based on user input

### 3. ScrollableList Test (`scrollable-list-test.svelte`)
Tests the ScrollableList component with a list of items.

**Run it:**
```bash
bun --conditions browser examples/scrollable-list-test-launcher.ts
```

**What it demonstrates:**
- ScrollableList with 20 items
- Keyboard navigation (arrow keys)
- Selection handling
- Display of selected item information

## Running the Examples

1. First, compile the Svelte component:
   ```bash
   node scripts/compile-svelte.mjs examples/[example-name].svelte
   ```

2. Then run the launcher:
   ```bash
   bun --conditions browser examples/[example-name]-launcher.ts
   ```

## Important Notes

- All component imports MUST use `.mjs` extension (e.g., `Box.svelte.mjs`)
- The `--conditions browser` flag is required for Svelte 5 client-side compatibility
- Press `Ctrl+C` to exit any example
- Debug mode is enabled by default to see rendering information

## Component Import Pattern

Always import pre-compiled components like this:
```javascript
import Box from '../src/components/ui/Box.svelte.mjs';
import Text from '../src/components/ui/Text.svelte.mjs';
```

## Text Component Usage

The Text component requires using the `content` prop for displaying text:
```svelte
<!-- Correct -->
<Text fg="green" content="Hello World" />
<Text content={`Dynamic value: ${myVariable}`} />

<!-- Currently not working (child text nodes) -->
<Text>Hello World</Text>
```

## Troubleshooting

If an example doesn't work:
1. Check that the component is compiled (`.svelte.mjs` file exists)
2. Verify import paths are correct and use `.mjs` extension
3. Ensure you're using `bun --conditions browser` to run the launcher
4. Check the debug output for any error messages