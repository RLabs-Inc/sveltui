// @bun
// src/renderer/index.ts
import { renderComponent, refreshComponents, destroyComponents } from "./render";
import { destroyScreen } from "./screen";
import { document } from "../dom";
import { createRenderer } from "./svelte-renderer";
import { RenderScheduler, globalScheduler } from "./render-scheduler";
import { RenderQueue } from "./render-queue";
import { renderScreen, renderImmediate, getRenderStats, pauseRendering, resumeRendering } from "./screen";
function render(component, options = {}) {
  return renderComponent(component, options);
}
function createTerminalRoot(options = {}) {
  return document;
}
function refresh() {
  refreshComponents();
}
function exit(code = 0) {
  destroyComponents();
  destroyScreen();
  process.exit(code);
}
export {
  resumeRendering,
  renderScreen,
  renderImmediate,
  render,
  refresh,
  pauseRendering,
  globalScheduler,
  getRenderStats,
  exit,
  createTerminalRoot,
  createRenderer,
  RenderScheduler,
  RenderQueue
};
