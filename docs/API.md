# SvelTUI API Reference

This document provides a comprehensive reference for the SvelTUI API.

## Renderer

The renderer is responsible for rendering Svelte components to the terminal.

### render

Renders a Svelte component to the terminal.

```typescript
function render(
  component: Component, 
  options?: RendererOptions
): () => void
```

**Parameters:**
- `component`: The Svelte component to render
- `options`: (Optional) Renderer configuration options

**Returns:**
- A cleanup function to destroy the component

**Example:**
```typescript
import { render } from 'sveltui';
import App from './App.svelte';

const cleanup = render(App, {
  title: 'My Terminal App',
  fullscreen: true,
});

// Later, to clean up
cleanup();
```

### RendererOptions

Options for configuring the renderer.

```typescript
interface RendererOptions {
  title?: string;
  fullscreen?: boolean;
  autofocus?: boolean;
  debug?: boolean;
  blessed?: Record<string, any>;
}
```

**Properties:**
- `title`: (Optional) Title for the terminal window
- `fullscreen`: (Optional) Whether to use fullscreen mode
- `autofocus`: (Optional) Whether to automatically focus the first focusable element
- `debug`: (Optional) Whether to enable debug mode with additional logging
- `blessed`: (Optional) Custom blessed configuration options

### refresh

Manually refreshes the terminal display.

```typescript
function refresh(): void
```

### exit

Exits the application gracefully.

```typescript
function exit(code?: number): never
```

**Parameters:**
- `code`: (Optional) Exit code (defaults to 0)

## Layout

The layout system provides utilities for positioning elements in the terminal.

### applyLayout

Applies layout to a container and its children.

```typescript
function applyLayout(
  container: TerminalElement,
  options?: LayoutOptions
): void
```

**Parameters:**
- `container`: The container element
- `options`: (Optional) Layout options

### LayoutOptions

Options for configuring the layout.

```typescript
interface LayoutOptions {
  direction?: LayoutDirection;
  justifyContent?: LayoutJustify;
  alignItems?: LayoutAlign;
  wrap?: boolean;
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  gap?: number;
}
```

### LayoutDirection

Direction of the layout (row or column).

```typescript
enum LayoutDirection {
  ROW = 'row',
  COLUMN = 'column',
}
```

### LayoutJustify

How to justify content along the main axis.

```typescript
enum LayoutJustify {
  START = 'start',
  CENTER = 'center',
  END = 'end',
  SPACE_BETWEEN = 'space-between',
  SPACE_AROUND = 'space-around',
}
```

### LayoutAlign

How to align items along the cross axis.

```typescript
enum LayoutAlign {
  START = 'start',
  CENTER = 'center',
  END = 'end',
  STRETCH = 'stretch',
}
```

### applyYogaLayout

Applies Yoga layout to a container and its children.

```typescript
function applyYogaLayout(
  container: TerminalElement,
  containerWidth: number,
  containerHeight: number,
  options?: YogaLayoutOptions
): void
```

**Parameters:**
- `container`: The container element
- `containerWidth`: The container width
- `containerHeight`: The container height
- `options`: (Optional) Yoga layout options

## Components

SvelTUI provides pre-bound component creators for common terminal elements.

### Box

Creates a box component.

```typescript
const Box = createComponent('box');
```

**Example:**
```typescript
import { Box } from 'sveltui';

const MyBox = Box({
  width: '50%',
  height: 10,
  border: true,
});
```

### Text

Creates a text component.

```typescript
const Text = createComponent('text');
```

### List

Creates a list component.

```typescript
const List = createComponent('list');
```

### Input

Creates an input component.

```typescript
const Input = createComponent('input');
```

### Button

Creates a button component.

```typescript
const Button = createComponent('button');
```

### Progress

Creates a progress bar component.

```typescript
const Progress = createComponent('progress');
```

## Element Properties

### BaseElementProps

Base properties common to all terminal elements.

```typescript
interface BaseElementProps {
  left?: number | string | 'center';
  top?: number | string | 'center';
  right?: number | string;
  bottom?: number | string;
  width?: number | string | 'half' | 'shrink';
  height?: number | string | 'half' | 'shrink';
  border?: boolean | 'line' | 'bg';
  borderColor?: string;
  label?: string;
  zIndex?: number;
  focusable?: boolean;
  hidden?: boolean;
  style?: {
    fg?: string;
    bg?: string;
    border?: {
      fg?: string;
      bg?: string;
    };
    label?: {
      fg?: string;
      bg?: string;
    };
    bold?: boolean;
    underline?: boolean;
    blink?: boolean;
    italic?: boolean;
  };
  tags?: boolean;
  content?: string;
  autofocus?: boolean;
  scrollable?: boolean;
  mouse?: boolean;
  [key: string]: any;
}
```

### BoxElementProps

Box element properties.

```typescript
interface BoxElementProps extends BaseElementProps {
  title?: string;
  children?: TerminalElement[];
}
```

### TextElementProps

Text element properties.

```typescript
interface TextElementProps extends BaseElementProps {
  content: string;
  align?: 'left' | 'center' | 'right';
  wrap?: boolean;
  truncate?: boolean | number;
}
```

### ListElementProps

List element properties.

```typescript
interface ListElementProps extends BaseElementProps {
  items?: string[];
  selected?: number;
  interactive?: boolean;
  keys?: boolean;
  vi?: boolean;
  mouse?: boolean;
  itemTag?: string;
  autoSelectOnFocus?: boolean;
}
```

### InputElementProps

Input element properties.

```typescript
interface InputElementProps extends BaseElementProps {
  value?: string;
  placeholder?: string;
  secret?: boolean;
  disabled?: boolean;
  maxLength?: number;
}
```

### ButtonElementProps

Button element properties.

```typescript
interface ButtonElementProps extends BaseElementProps {
  content: string;
  disabled?: boolean;
  pressed?: boolean;
}
```

### ProgressBarElementProps

Progress bar element properties.

```typescript
interface ProgressBarElementProps extends BaseElementProps {
  value?: number;
  orientation?: 'horizontal' | 'vertical';
  filled?: boolean;
  filledStyle?: {
    fg?: string;
    bg?: string;
  };
}
```

## Advanced APIs

These APIs are primarily for internal use but can be useful for advanced usage.

### DOM Operations

```typescript
function createElement(name: string): TerminalElementNode;
function createText(text: string): TerminalTextNode;
function createComment(text: string): TerminalNode;
function createFragment(): TerminalNode;
function insertNode(parent: TerminalNode, node: TerminalNode, anchor: TerminalNode | null): void;
function appendChild(parent: TerminalNode, child: TerminalNode): void;
function removeChild(parent: TerminalNode, child: TerminalNode): void;
function setAttribute(node: TerminalElementNode, name: string, value: any): void;
function removeAttribute(node: TerminalElementNode, name: string): void;
function setText(node: TerminalTextNode, text: string): void;
function setElementProps(node: TerminalElementNode, props: Record<string, any>): void;
function addEventListener(node: TerminalElementNode, event: string, handler: (event: any) => void): void;
function removeEventListener(node: TerminalElementNode, event: string): void;
```

## Version Information

```typescript
const VERSION: string; // Current SvelTUI version
```