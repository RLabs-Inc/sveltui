import * as blessed from "blessed";

// Component instance type
export interface ComponentInstance {
  id: string;
  type: string;
  element: blessed.Widgets.BlessedElement;
  props: Record<string, any>;
  children: ComponentInstance[];
}

// Render result type
export interface RenderResult {
  element: blessed.Widgets.BlessedElement;
  update: (newProps: Record<string, any>) => void;
  unmount: () => void;
}

// Select component option type
export interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

// Theme-related types
export type Color = string | null;

export interface Theme {
  name: string;
  description: string;
  author: string;
  version: string;

  colors: {
    // Base colors
    primary: Color;
    secondary: Color;
    background: Color;
    foreground: Color;

    // Status colors
    success: Color;
    warning: Color;
    error: Color;
    info: Color;
  };

  // Derived colors (calculated from base colors, but can be overridden)
  derived?: {
    surfaceColor?: Color;
    mutedText?: Color;
  };
}