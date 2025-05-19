# SveltUI Theming System

This document provides detailed information about SveltUI's theming system.

## Overview

SveltUI includes a flexible theming system that allows you to customize the appearance of your terminal UI applications. The theming system is designed to be:

- **Simple**: Easy to understand and use
- **Flexible**: Supports both built-in and custom themes
- **Extensible**: Allows loading themes from YAML files
- **Consistent**: Provides a unified look and feel across components

## Theme Structure

A theme in SveltUI consists of several sections:

```typescript
interface Theme {
  // Metadata
  name: string;
  description: string;
  author: string;
  version: string;
  
  // Base colors
  colors: {
    primary: Color;
    secondary: Color;
    background: Color;
    foreground: Color;
    success: Color;
    warning: Color;
    error: Color;
    info: Color;
  };
  
  // Derived colors (calculated or explicitly set)
  derived?: {
    surfaceColor?: Color;
    mutedText?: Color;
  };
  
  // Component-specific styling
  components?: {
    box?: {...},
    text?: {...},
    list?: {...},
    input?: {...},
  };
}
```

## Color Types

Colors in SveltUI can be specified in several formats:

- **Named terminal colors**: `"red"`, `"blue"`, `"green"`, etc.
- **Bright terminal colors**: `"brightred"`, `"brightblue"`, etc.
- **Hex colors**: `"#ff0000"`, `"#00ff00"`, etc.
- **null**: Indicates that the terminal's default color should be used

## Built-in Themes

SveltUI comes with three built-in themes:

### Terminal Theme

The Terminal theme uses the terminal's default colors. It's designed to respect the user's terminal configuration:

```typescript
const TerminalTheme = {
  name: "Terminal",
  description: "Uses the terminal's default colors",
  colors: {
    primary: "blue",
    secondary: "cyan",
    background: null,     // Use terminal default
    foreground: null,     // Use terminal default
    success: "green",
    warning: "yellow",
    error: "red",
    info: "blue",
  }
};
```

### Dark Theme

A dark theme with good contrast:

```typescript
const DarkTheme = {
  name: "Dark",
  colors: {
    primary: "#4a7fff",
    secondary: "#00ccbb",
    background: "#121212",
    foreground: "#ffffff",
    // ...
  }
};
```

### Light Theme

A light theme for users who prefer light backgrounds:

```typescript
const LightTheme = {
  name: "Light",
  colors: {
    primary: "#0066cc",
    secondary: "#009988",
    background: "#f5f5f5",
    foreground: "#333333",
    // ...
  }
};
```

## Using Themes

### Setting the Active Theme

To use a theme, import it and set it as the active theme:

```typescript
import { setTheme, DarkTheme } from "sveltui";

// Set the active theme
setTheme(DarkTheme);
```

### Getting the Current Theme

To get the currently active theme:

```typescript
import { getTheme } from "sveltui";

const currentTheme = getTheme();
```

### Available Theme Functions

SveltUI provides several functions for working with themes:

- `getTheme()`: Get the current theme
- `setTheme(theme)`: Set the active theme
- `loadTheme(filePath)`: Load a theme from a YAML file
- `registerTheme(theme)`: Register a custom theme
- `getAvailableThemes()`: Get a list of available theme names
- `createTheme(name, colors)`: Create a simple theme with basic colors

## Custom Themes

### Creating Themes Programmatically

You can create custom themes in your code:

```typescript
import { createTheme, setTheme } from "sveltui";

// Create a theme with basic colors
const purpleTheme = createTheme("Purple", {
  primary: "#9966ff",
  background: "#1a1a2e",
  foreground: "#e6e6ff"
});

// Use the theme
setTheme(purpleTheme);
```

For more control, you can create a complete theme object:

```typescript
import { Theme, setTheme } from "sveltui";

const customTheme: Theme = {
  name: "Custom",
  description: "My custom theme",
  author: "Your Name",
  version: "1.0.0",
  colors: {
    primary: "#ff5500",
    secondary: "#00aaff",
    background: "#2d2d2d",
    foreground: "#f0f0f0",
    success: "#00cc66",
    warning: "#ffcc00",
    error: "#ff3333",
    info: "#0099ff",
  },
  derived: {
    surfaceColor: "#3d3d3d",
    mutedText: "#a0a0a0",
  },
  components: {
    box: {
      border: {
        color: "#ff5500",
        focusColor: "#00aaff",
      }
    },
    // Other component styling...
  }
};

setTheme(customTheme);
```

### Loading Themes from YAML

You can define themes in YAML files and load them at runtime:

```typescript
import { loadTheme, setTheme } from "sveltui";

const theme = loadTheme("./themes/ocean.yaml");
if (theme) {
  setTheme(theme);
}
```

Example YAML file:

```yaml
name: "Ocean"
description: "A soothing blue theme"
author: "RLabs Inc."
version: "1.0.0"

colors:
  primary: "#0077cc"
  secondary: "#00ccbb"
  background: "#05233b"
  foreground: "#e1f2ff"
  
  success: "#00cc77"
  warning: "#ffbb00"
  error: "#ff5555"
  info: "#55aaff"

derived:
  surfaceColor: "#072e4f"
  mutedText: "#a0c0e0"

components:
  box:
    border:
      color: "#0099ff"
  list:
    item:
      selected:
        background: "#0088dd"
```

## Component Theming

Each component type in SveltUI can have specific styling defined in the theme:

### Box Component

```typescript
components: {
  box: {
    background: Color;
    foreground: Color;
    border: {
      color: Color;
      focusColor: Color;
    }
  }
}
```

### Text Component

```typescript
components: {
  text: {
    normal: Color;
    muted: Color;
    bold: {
      color: Color;
    }
  }
}
```

### List Component

```typescript
components: {
  list: {
    background: Color;
    item: {
      normal: Color;
      selected: {
        background: Color;
        foreground: Color;
      };
      hover: {
        background: Color;
      }
    }
  }
}
```

### Input Component

```typescript
components: {
  input: {
    background: Color;
    foreground: Color;
    placeholder: Color;
    border: {
      color: Color;
      focusColor: Color;
    }
  }
}
```

## Default Color Derivation

When certain colors aren't explicitly set in a theme, SveltUI will derive them from base colors:

- **surfaceColor**: Slightly lighter than `background` (for panels)
- **mutedText**: `foreground` with reduced opacity

## CLI Text Styling

SveltUI also provides utilities for styling CLI text output based on the current theme:

```typescript
import { text } from "sveltui";

console.log(text.normal("Normal text"));
console.log(text.muted("Muted text"));
console.log(text.primary("Primary-colored text"));
console.log(text.secondary("Secondary-colored text"));
console.log(text.success("Success message"));
console.log(text.warning("Warning message"));
console.log(text.error("Error message"));
console.log(text.info("Info message"));
console.log(text.bold("Bold text"));
```

## Example Usage

Here's a complete example of setting up a themed application:

```typescript
import { 
  initializeScreen, 
  render, 
  setTheme, 
  loadTheme,
  DarkTheme 
} from "sveltui";

// Try to load a custom theme, fall back to dark theme
const customTheme = loadTheme("./themes/custom.yaml");
setTheme(customTheme || DarkTheme);

// Create the UI
const screen = initializeScreen({ title: "Themed App" });

const main = render("box", {
  width: "100%",
  height: "100%",
  border: true,
});

// Create a panel using the surface color
const panel = render("box", {
  parent: main.element,
  width: "80%",
  height: "50%",
  top: "center",
  left: "center",
  border: true,
  type: "panel", // This will use the surface color
});

render("text", {
  parent: panel.element,
  top: "center",
  left: "center",
  content: "This text uses the theme's foreground color",
});

render("text", {
  parent: panel.element,
  top: "center+2",
  left: "center",
  content: "This text uses the muted color",
  muted: true,
});

screen.render();
```

## Best Practices

- **Use null for Terminal Theme**: Use `null` for color values in the Terminal theme to inherit terminal colors
- **Test Themes**: Test your themes in different terminal environments to ensure good contrast
- **Provide All Colors**: Define all color values in custom themes for consistency
- **Use Semantic Colors**: Use semantic colors (success, warning, etc.) for appropriate content
- **Surface for Panels**: Use the `type: "panel"` property to apply surface color to containers