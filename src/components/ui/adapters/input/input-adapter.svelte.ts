/**
 * Input Adapter for SveltUI
 *
 * This adapter connects the Input Svelte component to blessed's implementation.
 * It handles the creation, event binding, and updating of input elements.
 */

import * as blessed from "blessed";
import {
  createBaseElement,
  setupBaseEvents,
  updateBaseProps,
} from "../base-adapter.svelte";

// Input-specific excluded props
const INPUT_EXCLUDED_PROPS = ["value", "placeholder", "onChange", "onSubmit"];

/**
 * Create an input blessed element
 */
export function createInput(
  props: Record<string, any>,
  parent?: blessed.Widgets.Node
): blessed.Widgets.BlessedElement {
  // Create the input as a blessed textbox
  const input = createBaseElement(
    {
      ...props,
      inputOnFocus: true, // Automatically enter input mode when focused
    },
    { type: "textbox", parent, interactive: true }
  );

  // Set up input-specific events
  setupInputEvents(input, props);

  // Set up base events
  setupBaseEvents(input, props);

  // Set the initial value if provided
  if (props.value) {
    (input as any).setValue(props.value);
  }

  return input;
}

/**
 * Set up input-specific event handlers
 */
function setupInputEvents(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Handle input changes
  if (props.onChange) {
    element.on("input", (value) => {
      props.onChange(value);
    });
  }

  // Handle form submission
  if (props.onSubmit) {
    element.on("submit", (value) => {
      props.onSubmit(value);
    });
  }

  // Configure special keys
  element.key(["escape"], (ch, key) => {
    // Blur on escape
    element.screen.render();
  });
}

/**
 * Update an input element with new props
 */
export function updateInput(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Update the value if provided
  if ("value" in props && "setValue" in element) {
    (element as any).setValue(props.value);
  }

  // Update placeholder if provided
  if ("placeholder" in props) {
    (element as any).placeholder = props.placeholder;
  }

  // Update other properties
  updateBaseProps(element, props, INPUT_EXCLUDED_PROPS);
}

/**
 * Default input props
 */
export const inputDefaultProps = {
  value: "",
  placeholder: "",
  width: "50%",
  height: 3,
  border: true,
};
