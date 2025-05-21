# SvelTUI Simple Counter Example

This example demonstrates a basic counter application using SvelTUI.

## Concepts Demonstrated

- Basic UI structure with boxes and text elements
- Svelte 5 reactivity using `$state`
- Event handling for clicks
- Terminal UI styling

## Running the Example

```bash
# Install dependencies
bun install

# Compile the Svelte component first
bun run compile:counter

# Run the example
bun run example:counter
```

## How It Works

1. The Svelte component (`App.svelte`) is first compiled to JavaScript using the Svelte compiler
2. The compiled component is then loaded and rendered to the terminal
3. The counter state is managed using Svelte 5's `$state` reactivity system
4. Button clicks are handled by the `onclick` event handlers

## Keyboard Controls

- Press `+` button to increment the counter
- Press `-` button to decrement the counter
- Press `q` or `Ctrl+C` to exit the application