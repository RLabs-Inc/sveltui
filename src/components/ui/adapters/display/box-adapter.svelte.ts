/**
 * Box Adapter for SvelTUI
 *
 * This adapter connects the Box Svelte component to blessed's implementation.
 * It handles creating and updating box elements.
 */

import * as blessed from "blessed";
import {
  createBaseElement,
  setupBaseEvents,
  updateBaseProps,
} from "../base-adapter.svelte";

// Box-specific excluded props
const BOX_EXCLUDED_PROPS = ["children", "content"];

/**
 * Create a box blessed element
 */
export function createBox(
  props: Record<string, any>,
  parent?: blessed.Widgets.Node
): blessed.Widgets.BlessedElement {
  // Create the box element
  const box = createBaseElement(props, {
    type: "box",
    parent,
    interactive: !!props.onClick,
  });

  // Set up base events
  setupBaseEvents(box, props);

  // Initial content update
  if (props.content) {
    box.setContent(props.content);
  }

  return box;
}

/**
 * Update a box element with new props
 */
export function updateBox(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Update content if provided
  if (props.content && "setContent" in element) {
    (element as any).setContent(props.content);
  }

  // Update other properties
  updateBaseProps(element, props, BOX_EXCLUDED_PROPS);
}

/**
 * Default box props
 */
export const boxDefaultProps = {
  width: "100%",
  height: "100%",
  border: false,
};
