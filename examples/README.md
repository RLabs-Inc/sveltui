# SvelTUI Examples

This directory contains 6 core examples showcasing SvelTUI's essential features. Each example is designed to demonstrate specific capabilities while maintaining clarity and consistency.

## Core Examples

### 1. Basic Counter (`basic-counter.svelte`)
**Features:** Reactive state with `$state` and `$derived` runes

**Run it:**
```bash
bun --conditions browser examples/basic-counter-launcher.ts
```

**What it demonstrates:**
- Svelte 5 `$state` and `$derived` runes
- Automatic reactive updates
- Auto-incrementing counter with derived values
- Dynamic styling based on state

### 2. Interactive List (`interactive-list.svelte`)
**Features:** Keyboard navigation and item selection

**Run it:**
```bash
bun --conditions browser examples/interactive-list-launcher.ts
```

**What it demonstrates:**
- ScrollableList component with keyboard navigation
- Arrow key navigation (up/down)
- Item selection with Enter key
- Dynamic feedback on selected items

### 3. Text Input (`text-input.svelte`)
**Features:** Two-way binding and form handling

**Run it:**
```bash
bun --conditions browser examples/text-input-launcher.ts
```

**What it demonstrates:**
- TextInput component with focus management
- Two-way data binding with `bind:value`
- Form submission handling
- Real-time input validation and feedback

### 4. Layout Demo (`layout-demo.svelte`)
**Features:** Flexbox-style positioning and sizing

**Run it:**
```bash
bun --conditions browser examples/layout-demo-launcher.ts
```

**What it demonstrates:**
- Percentage-based positioning (`50%`, `100%`)
- Center alignment and relative offsets
- Responsive layout with constraints
- Multiple positioning strategies in one demo

### 5. Style States (`style-states.svelte`)
**Features:** Hover, focus, and pressed styling

**Run it:**
```bash
bun --conditions browser examples/style-states-launcher.ts
```

**What it demonstrates:**
- StyleState system for interactive elements
- Hover, focus, and pressed state transitions
- Dynamic style switching
- Advanced color and border state management

### 6. Event Handling (`event-handling.svelte`)
**Features:** Click, keyboard, and custom events

**Run it:**
```bash
bun --conditions browser examples/event-handling-launcher.ts
```

**What it demonstrates:**
- Keyboard event handling
- Mouse click events (if supported)
- Custom event creation and dispatching
- Event bubbling and delegation

## Running Examples

All examples follow the same pattern:

1. **Compile** (if needed): 
   ```bash
   node scripts/compile-svelte.mjs examples/[example-name].svelte
   ```

2. **Run**:
   ```bash
   bun --conditions browser examples/[example-name]-launcher.ts
   ```

3. **Exit**: Press `Ctrl+C` to quit any example

## Important Notes

- **Browser Conditions Required**: All launchers use `bun --conditions browser` for Svelte 5 client-side compatibility
- **Pre-compiled Components**: Examples use `.svelte.mjs` files (compiled versions)
- **Consistent Launcher Pattern**: All launchers follow the same setupBrowserGlobals + createRenderer pattern
- **Working Pattern**: Based on the proven `final-working-binding.ts` launcher architecture

## Example Structure

Each example consists of:
- `[name].svelte` - Svelte component source
- `[name].svelte.mjs` - Compiled component  
- `[name]-launcher.ts` - Launcher script with proper browser globals setup

## Component Import Pattern

All examples import pre-compiled components:
```javascript
import Box from '../src/components/ui/Box.svelte.mjs';
import Text from '../src/components/ui/Text.svelte.mjs';
```

## Text Component Usage

The Text component requires the `content` prop:
```svelte
<!-- Correct -->
<Text fg="green" content="Hello World" />
<Text content={`Dynamic: ${myVariable}`} />

<!-- Not yet supported -->
<Text>Hello World</Text>
```

## Troubleshooting

If an example doesn't work:

1. **Check Compilation**: Ensure `.svelte.mjs` file exists and is up-to-date
2. **Verify Imports**: All imports must use `.mjs` extension  
3. **Browser Conditions**: Always run with `bun --conditions browser`
4. **Debug Mode**: Add `--debug` flag for verbose output
5. **Check Dependencies**: Verify all component dependencies are compiled

## Development Workflow

1. Edit `.svelte` source file
2. Recompile: `node scripts/compile-svelte.mjs examples/[name].svelte`
3. Test: `bun --conditions browser examples/[name]-launcher.ts`
4. Repeat as needed

These examples represent the essential features of SvelTUI and provide a solid foundation for building terminal UI applications with Svelte 5.