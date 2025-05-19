import * as blessed from "blessed";
import {
  createBlessedElement,
  updateBlessedElement,
} from "./blessed-utils.svelte";
import type { RenderResult } from "./types";
import { 
  getTheme, 
  setTheme, 
  loadTheme, 
  registerTheme, 
  getAvailableThemes,
  getThemeFiles,
  createTheme 
} from "./theme-manager";
import type { Theme, Color } from "./theme";
import { TerminalTheme, DarkTheme, LightTheme } from "./theme";

// Export theme-related functions and types
export { 
  getTheme, 
  setTheme, 
  loadTheme, 
  registerTheme, 
  getAvailableThemes,
  getThemeFiles,
  createTheme,
  TerminalTheme,
  DarkTheme,
  LightTheme,
  type Theme,
  type Color
};

// Active screen
let screen: blessed.Widgets.Screen | null = null;

// Initialize a blessed screen
export function initializeScreen(
  options: blessed.Widgets.IScreenOptions = {}
): blessed.Widgets.Screen {
  const defaultOptions: blessed.Widgets.IScreenOptions = {
    smartCSR: true,
    title: "SveltUI Application",
    ...options,
  };

  screen = blessed.screen(defaultOptions);

  // We'll handle exit keys in the application code
  // This allows for more flexibility in key handling
  
  // Initial render
  screen.render();

  return screen;
}

// Render a terminal UI element
export function render(
  elementType: string,
  props: Record<string, any> = {},
  target: blessed.Widgets.Screen | blessed.Widgets.BlessedElement = screen!
): RenderResult {
  if (!screen) {
    throw new Error("Screen not initialized. Call initializeScreen first.");
  }

  // Create the element - all props are applied during creation
  const element = createBlessedElement(
    elementType,
    props,
    target as blessed.Widgets.BlessedElement
  );

  // Create a tracker for props
  let currentProps = props;

  // No need to update immediately since props were already applied during creation
  screen?.render();

  // Return the result
  return {
    element,
    update: (newProps: Record<string, any>) => {
      // Update props and immediately apply changes
      Object.assign(currentProps, newProps);
      updateBlessedElement(element, currentProps);
      screen?.render();
    },
    unmount: () => {
      element.destroy();
      screen?.render();
    },
  };
}
