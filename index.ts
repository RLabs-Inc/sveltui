// Initialize component registry
import { initializeRegistry } from "./src/core/registry.svelte";
initializeRegistry();

// Export core renderer
export * from "./src/core/renderer.svelte";
export * from "./src/core/reconciler.svelte";
export * from "./src/core/registry.svelte";
export * from "./src/core/blessed-utils.svelte";

// Export components
export { default as Box } from "./src/components/Box.svelte";
export { default as Text } from "./src/components/Text.svelte";
export { default as Input } from "./src/components/Input.svelte";
export { default as List } from "./src/components/List.svelte";

// Version export
export const VERSION = "0.0.1";
