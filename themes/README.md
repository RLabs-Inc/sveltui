# SveltUI Themes

This directory contains themes for SveltUI applications.

## Directory Structure

- `/built-in/`: Contains built-in themes that ship with SveltUI
- `/custom/`: For your custom themes

## Using Themes

To use a theme in your application:

```typescript
import { loadTheme, setTheme } from "sveltui";

// Load a built-in theme
const oceanTheme = loadTheme("./themes/built-in/ocean.yaml");
if (oceanTheme) {
  setTheme(oceanTheme);
}

// Or load a custom theme
const myTheme = loadTheme("./themes/custom/my-theme.yaml");
if (myTheme) {
  setTheme(myTheme);
}
```

## Creating Custom Themes

Create a YAML file in the `/custom/` directory with the following structure:

```yaml
name: "My Theme"
description: "A description of my theme"
author: "Your Name"
version: "1.0.0"

colors:
  primary: "#ff0000"      # Main accent color
  secondary: "#00ff00"    # Secondary accent color
  background: "#000000"   # Background color
  foreground: "#ffffff"   # Text color
  
  # Status colors
  success: "#00ff00"      # Success messages
  warning: "#ffff00"      # Warning messages
  error: "#ff0000"        # Error messages
  info: "#0000ff"         # Info messages

derived:
  surfaceColor: "#111111" # Color for panels (slightly lighter than background)
  mutedText: "#aaaaaa"    # Color for less important text

components:
  # Component-specific styling (optional)
  box:
    border:
      color: "#ff0000"     # Border color
      focusColor: "#00ff00" # Border color when focused
  
  list:
    item:
      selected:
        background: "#ff0000" # Background for selected items
        foreground: "#ffffff" # Text color for selected items
      hover:
        background: "#222222" # Background for hovered items
  
  input:
    border:
      color: "#ff0000"      # Border color
      focusColor: "#00ff00" # Border color when focused
    placeholder: "#777777"  # Placeholder text color
```

Colors can be specified as:
- Hex codes (`#ff0000`)
- Named terminal colors (`red`, `blue`, `green`, etc.)
- Bright terminal colors (`brightred`, `brightblue`, etc.)
- `null` to use the terminal's default color

## Default Themes

SveltUI comes with the following built-in themes:

- `terminal.yaml`: Uses terminal default colors
- `dark.yaml`: A dark theme with blue accents
- `light.yaml`: A light theme with blue accents
- `ocean.yaml`: A soothing blue theme
- `forest.yaml`: A nature-inspired green theme
- `sunset.yaml`: A warm orange and gray theme
- `cyberpunk.yaml`: A vibrant neon theme

## Theme Preview

You can preview all available themes by running:

```bash
bun run theme-demo
```