// Initialize component registry
import { initializeRegistry } from "./src/core/registry.svelte";
initializeRegistry();

// Export core renderer
export * from "./src/core/renderer.svelte";
export * from "./src/core/reconciler.svelte";
export * from "./src/core/registry.svelte";

// Export type definitions
export * from "./src/types";

// Export theme-related modules
export * from "./src/theme/theme.svelte";
export * from "./src/theme/theme-manager.svelte";

// Export utilities for CLI apps
export * from "./src/utils/color-utils.svelte";
export * from "./src/utils/blessed-utils.svelte";
export * from "./src/utils/component-utils.svelte";

// Export components
export { default as Box } from "./src/components/ui/Box.svelte";
export { default as Text } from "./src/components/ui/Text.svelte";
export { default as Input } from "./src/components/ui/Input.svelte";
export { default as List } from "./src/components/ui/List.svelte";
export { default as Checkbox } from "./src/components/ui/Checkbox.svelte";

// Version export
export const VERSION = "0.0.1";
