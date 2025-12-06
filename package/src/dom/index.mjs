// @bun
// src/dom/index.ts
export * from "./nodes";
export * from "./elements";
export * from "./document";
export * from "./factories";
export * from "./positioning";
export * from "./reactive-element";
export * from "./reactive-bridge";
export * from "./config";
import { StyleState, createStyleState, useStyleStateEvents } from './style-state.svelte.js';

export * from "./style-utils";
export * from './reactive-events.svelte.js';
export * from "./event-bridge";
import { factories as factories2 } from "./factories";
import { registerElement } from "./elements";
import { document as document2, createElement, createTextNode, createComment, createDocumentFragment } from "./document";
for (const [type, factory] of Object.entries(factories2)) {
  registerElement(type, factory);
}
export {
  useStyleStateEvents,
  document2 as document,
  createTextNode,
  createStyleState,
  createElement,
  createDocumentFragment,
  createComment,
  StyleState
};
