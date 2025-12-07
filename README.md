# SvelTUI

> ⚠️ **Early Stage** - SvelTUI is functional and actively developed, but still in early stages. APIs may change. We'd love your feedback and contributions!

**Build beautiful terminal applications with Svelte 5**

SvelTUI is a terminal UI framework that brings Svelte's elegant reactive programming model to the command line. Write declarative components, enjoy instant reactivity, and build responsive terminal interfaces with the same developer experience you love from web development.

```svelte
<script>
  import { Box, Text, keyboard } from 'sveltui'

  let count = $state(0)
  keyboard.onKey('Space', () => count++)
</script>

<Box border="rounded" borderColor={0x06} padding={1}>
  <Text text="Press Space!" color={0x0a} />
  <Text text={`Count: ${count}`} color={0x0b} />
</Box>
```

## Why SvelTUI?

### Reactive by Design

Unlike traditional terminal UI libraries that redraw at fixed intervals, SvelTUI only updates what actually changed, when it changes. Press a key and see the result instantly - no frame delay, no flickering, no wasted CPU cycles.

### Svelte 5 Runes

Built from the ground up for Svelte 5's new reactivity system. Use `$state`, `$derived`, and `$effect` naturally - they just work in the terminal.

### Flexbox Layout

Full CSS flexbox support via Facebook's Yoga layout engine. Finally, sane layouts in the terminal.

### Zero Flickering

Differential rendering updates only the cells that changed. Your UI stays rock solid.

## Features

- **Components** - `Box`, `Text`, and more coming soon
- **Flexbox Layout** - Powered by Yoga layout engine
- **Keyboard Handling** - Reactive + imperative APIs
- **Mouse Support** - Click, scroll, and hover events
- **Focus Management** - Tab navigation built-in
- **Theming** - Built-in themes (default, dracula, nord, monokai, solarized)
- **Border Styles** - single, double, rounded, bold, dashed, dotted
- **True Color** - Full 24-bit color support
- **TypeScript** - First-class TypeScript support

## Quick Start

### Create a New Project

```bash
# Using the CLI (recommended)
bunx @rlabs-inc/sveltui create my-app
cd my-app
bun install
bun run dev
```

The CLI offers three starter templates:

- **minimal** - Clean starting point with just Box and Text
- **counter** - Interactive demo with keyboard input and reactivity
- **dashboard** - Full showcase with layout, scrolling, and live updates

```bash
# Skip template selection with --template
bunx @rlabs-inc/sveltui create my-app --template dashboard
```

### Manual Setup

```bash
mkdir my-app && cd my-app
bun init -y
bun add sveltui svelte
```

Create `src/main.ts`:

```typescript
import { mount } from 'sveltui'
import { mount as mountComponent } from 'svelte'
import App from './App.svelte'

mount(() => {
  mountComponent(App, { target: document.body })
}, { fullscreen: true })
```

Create `src/App.svelte`:

```svelte
<script>
  import { Box, Text } from 'sveltui'
</script>

<Box width="100%" height="100%" padding={2}>
  <Box border="rounded" borderColor={0x06} padding={1}>
    <Text text="Hello, Terminal!" color={0x0a} />
  </Box>
</Box>
```

## Components

### Box

Container component with flexbox layout, borders, and background colors.

```svelte
<Box
  border="rounded"
  borderColor={0x06}
  backgroundColor={0x000033}
  width={40}
  height={10}
  padding={1}
>
  <Text text="Content inside a box" />
</Box>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `border` | `'none'` \| `'single'` \| `'double'` \| `'rounded'` \| `'bold'` \| `'dashed'` \| `'dotted'` | Border style |
| `borderColor` | `number` \| `string` | Border color (hex number or CSS color) |
| `backgroundColor` | `number` \| `string` | Background color |
| `width`, `height` | `number` \| `string` | Dimensions (number for chars, string like `"50%"` for percentage) |
| `padding`, `paddingX`, `paddingY` | `number` | Inner padding |
| `margin`, `marginX`, `marginY` | `number` | Outer margin |
| `flexDirection` | `'row'` \| `'column'` | Main axis direction |
| `flexGrow` | `number` | How much to grow relative to siblings |
| `justifyContent` | `'flex-start'` \| `'center'` \| `'flex-end'` \| `'space-between'` | Main axis alignment |
| `alignItems` | `'flex-start'` \| `'center'` \| `'flex-end'` \| `'stretch'` | Cross axis alignment |
| `gap` | `number` | Space between children |
| `focusable` | `boolean` | Whether the box can receive focus |
| `variant` | `'primary'` \| `'secondary'` \| `'accent'` \| `'success'` \| `'warning'` \| `'danger'` \| `'info'` | Theme-based styling |

### Text

Renders styled text content.

```svelte
<Text
  text="Hello World"
  color={0x00ff00}
  bold
/>
```

> ⚠️ **Important**: Always use the `text` prop, not children. Due to how Svelte handles children rendering, `<Text text="Hello" />` works correctly with reactivity, but `<Text>Hello</Text>` does not update reactively.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | The text content to display (required) |
| `color` | `number` \| `string` | Text color (hex number or CSS color) |
| `bold` | `boolean` | Bold text |
| `italic` | `boolean` | Italic text |
| `underline` | `boolean` | Underlined text |
| `dim` | `boolean` | Dimmed text |
| `variant` | `'primary'` \| `'secondary'` \| `'accent'` \| `'success'` \| `'warning'` \| `'danger'` \| `'info'` | Theme-based color |
| `muted` | `boolean` | Use theme's muted text color |
| `bright` | `boolean` | Use theme's bright text color |

## Keyboard API

SvelTUI provides a hybrid keyboard API - reactive state for UI display, imperative callbacks for event handling.

### Reactive (for templates)

```svelte
<script>
  import { keyboard } from 'sveltui'
</script>

<!-- Automatically updates when any key is pressed -->
<Text text={`Last key: ${keyboard.lastKey}`} />
```

### Imperative (for actions)

```svelte
<script>
  import { keyboard } from 'sveltui'
  import { onDestroy } from 'svelte'

  // Single key
  const unsub = keyboard.onKey('Enter', () => {
    console.log('Enter pressed!')
  })

  // Multiple keys
  const unsub2 = keyboard.onKey(['ArrowUp', 'k'], () => {
    scrollUp()
  })

  // All keys
  const unsub3 = keyboard.on((event) => {
    console.log(event.key, event.ctrlKey, event.shiftKey)
  })

  onDestroy(() => {
    unsub()
    unsub2()
    unsub3()
  })
</script>
```

### Focus Management

```svelte
<script>
  import { keyboard } from 'sveltui'

  // Built-in: Tab and Shift+Tab cycle focus automatically

  // Programmatic control
  keyboard.focusNext()
  keyboard.focusPrevious()
  keyboard.clearFocus()
</script>
```

### Available Keys

- **Arrows**: `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`
- **Navigation**: `Home`, `End`, `PageUp`, `PageDown`
- **Actions**: `Enter`, `Escape`, `Tab`, `Shift+Tab`, `Backspace`, `Delete`
- **Modifiers**: `Ctrl+A` through `Ctrl+Z`, `Ctrl+C` (exits app)
- **Characters**: Any printable character (`a`, `A`, `1`, `!`, etc.)

## Mount Options

```typescript
import { mount } from 'sveltui'

mount(() => {
  // Your app initialization
}, {
  fullscreen: true  // Use alternate screen buffer (recommended)
})
```

## Architecture

SvelTUI's architecture is designed for performance and simplicity:

```
┌─────────────────────────────────────────────────────────┐
│                    Your Svelte App                       │
│         (Components, State, Event Handlers)              │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                   Svelte 5 Reactivity                    │
│            ($state, $derived, $effect)                   │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    SvelTUI Engine                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Typed Array │  │    Yoga     │  │   Differential  │  │
│  │    State    │  │   Layout    │  │    Renderer     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                      Terminal                            │
│              (ANSI escape sequences)                     │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Reactive-on-demand Rendering**: No fixed FPS loop. Updates happen instantly when state changes, and nothing happens when state is stable.

2. **Typed Arrays for State**: Component properties stored in typed arrays for cache-friendly access and minimal memory overhead.

3. **Differential Rendering**: Only changed cells are written to the terminal. Press a key, and only the affected characters update.

4. **Happy DOM Integration**: Svelte needs a DOM to work. We use Happy DOM as a lightweight shim, letting Svelte's reactivity work unchanged.

## Colors

SvelTUI supports multiple color formats:

```svelte
<!-- Hex number (recommended for performance) -->
<Text text="Red" color={0xff0000} />

<!-- CSS color names -->
<Text text="Blue" color="blue" />

<!-- Hex string -->
<Text text="Green" color="#00ff00" />

<!-- RGB -->
<Text text="Yellow" color="rgb(255, 255, 0)" />
```

## Themes

SvelTUI includes a powerful theming system with semantic colors. Use the `variant` prop on components to automatically apply theme colors:

### Using Variants

```svelte
<!-- Box variants affect border color -->
<Box variant="primary" border="rounded">
  <Text text="Primary box" />
</Box>

<Box variant="success" border="single">
  <Text text="Success!" />
</Box>

<!-- Text variants affect text color -->
<Text text="Warning message" variant="warning" />
<Text text="Error occurred" variant="danger" />
<Text text="Information" variant="info" />

<!-- Text also has muted/bright options -->
<Text text="Subtle hint" muted />
<Text text="Important!" bright />
```

**Available variants:**

| Variant | Use Case |
|---------|----------|
| `primary` | Main actions, focused elements |
| `secondary` | Secondary actions, less emphasis |
| `accent` | Highlighted elements, special emphasis |
| `success` | Positive feedback, confirmations |
| `warning` | Caution, important notices |
| `danger` | Errors, destructive actions |
| `info` | Informational messages |

### Changing Themes

```svelte
<script>
  import { getTheme } from 'sveltui'

  const theme = getTheme()

  // Switch to a different theme
  theme().setTheme('dracula')
</script>
```

**Available themes:** `default`, `dracula`, `nord`, `monokai`, `solarized`

### Accessing Theme Colors Directly

```svelte
<script>
  import { getTheme } from 'sveltui'

  const theme = getTheme()

  // Access theme colors for custom use
  const primaryColor = theme().colors.primary
  const bgColor = theme().colors.background
</script>

<Text text="Custom styled" color={theme().colors.accent} />
```

## Requirements

- **Bun** >= 1.0.0 (runtime and build tool)
- **Node.js** >= 18.0.0 (if not using Bun)
- A terminal with true color support (most modern terminals)

## Development

```bash
# Clone the repository
git clone https://github.com/RLabs-Inc/sveltui.git
cd sveltui

# Install dependencies
bun install

# Build the framework
bun run build

# Run the demo
bun run demo
```

## Contributing

Contributions are welcome! Whether it's:

- Bug reports and feature requests
- Documentation improvements
- New components
- Performance optimizations
- Test coverage

Please feel free to open an issue or submit a pull request.

## Known Issues

- **Terminal resize in non-fullscreen mode** - Resizing the terminal window may cause rendering artifacts when not using `fullscreen: true`. Workaround: use fullscreen mode for apps that need resize support.

## Roadmap

- [ ] Fix non-fullscreen resize handling
- [ ] More components (Input, List, Table, Progress, etc.)
- [ ] Animation primitives
- [ ] Mouse event improvements
- [ ] Documentation site
- [ ] More themes

## Acknowledgments

SvelTUI stands on the shoulders of giants:

- [Svelte](https://svelte.dev) - The reactive UI framework that makes this possible
- [Yoga](https://yogalayout.dev) - Facebook's flexbox implementation
- [Ink](https://github.com/vadimdemedes/ink) - Inspiration for React-based terminal UIs
- [Blessed](https://github.com/chjj/blessed) - The classic Node.js terminal library

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with Svelte 5 and a lot of terminal escape sequences
</p>
