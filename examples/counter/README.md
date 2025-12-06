# Counter Demo

A simple counter application built with SvelTUI that demonstrates:

- **Keyboard input handling** with + and - keys
- **Reactive state** using Svelte 5 runes
- **Terminal UI components** (Box and Text)
- **Layout and styling** with flexbox and borders

## Running the Demo

```bash
bun install
bun run demo
```

## Controls

- Press `+` or `=` to increment the counter
- Press `-` to decrement the counter
- Press `Ctrl+C` to exit

## Code Structure

- `Counter.svelte` - The main counter component
- `main.ts` - Entry point that mounts the app
- `package.json` - Dependencies and scripts

## What You'll Learn

This demo showcases the core features of SvelTUI:

1. **Component-based UI** - Build terminal UIs just like web UIs with Svelte
2. **Reactive state** - Use `$state` for reactive variables
3. **Keyboard events** - Handle keyboard input with the keyboard module
4. **Layout system** - Use flexbox properties for positioning
5. **Styling** - Apply colors, borders, and text formatting
