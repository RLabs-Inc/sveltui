/**
 * Text Adapter for SvelTUI
 *
 * This adapter connects the Text Svelte component to blessed's implementation.
 * It handles creating and updating text elements.
 */

import * as blessed from "blessed";
import {
  createBaseElement,
  setupBaseEvents,
  updateBaseProps,
} from "../base-adapter.svelte";

// Text-specific excluded props
const TEXT_EXCLUDED_PROPS = ["content", "color", "bold", "italic", "align"];

/**
 * Create a text blessed element
 */
export function createText(
  props: Record<string, any>,
  parent?: blessed.Widgets.Node
): blessed.Widgets.BlessedElement {
  // Convert text-specific props to blessed style
  const textProps = { ...props };

  // Build style object if not already provided
  textProps.style = textProps.style || {};

  // Apply text styles
  if (props.color) {
    textProps.style.fg = props.color;
  }

  if (props.bold) {
    textProps.style.bold = props.bold;
  }

  if (props.italic) {
    textProps.style.italic = props.italic;
  }

  // Create the text element
  const text = createBaseElement(textProps, {
    type: "text",
    parent,
    interactive: false,
  });

  // Set up base events
  setupBaseEvents(text, props);

  // Initial content update
  if (props.content) {
    text.setContent(props.content);
  }

  return text;
}

/**
 * Update a text element with new props
 */
export function updateText(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Update content if provided
  if (props.content && "setContent" in element) {
    (element as any).setContent(props.content);
  }

  // Update style properties
  element.style = element.style || {};

  if (props.color) {
    element.style.fg = props.color;
  }

  if (props.bold !== undefined) {
    element.style.bold = props.bold;
  }

  if (props.italic !== undefined) {
    element.style.italic = props.italic;
  }

  // Update text alignment
  if (props.align) {
    (element as any).align = props.align;
  }

  // Update other properties
  updateBaseProps(element, props, TEXT_EXCLUDED_PROPS);
}

/**
 * Default text props
 */
export const textDefaultProps = {
  width: "shrink",
  height: "shrink",
  content: "",
  color: "white",
};
