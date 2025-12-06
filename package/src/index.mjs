// @bun
// src/index.ts
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { mount } from './mount.svelte.js';
import { keyboard } from './input/keyboard.svelte.js';
import { default as default2 } from './components/Text.svelte.mjs';
import { default as default3 } from './components/Box.svelte.mjs';
import { default as default4 } from './components/Input.svelte.mjs';
GlobalRegistrator.register();
if (!global.document || !global.window) {
  throw new Error("SvelTUI: Failed to initialize Happy DOM environment");
}
export {
  mount,
  keyboard,
  default2 as Text,
  default4 as Input,
  default3 as Box
};
