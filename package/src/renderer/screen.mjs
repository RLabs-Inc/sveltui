// @bun
// src/renderer/screen.ts
import blessed from "blessed";
import { globalScheduler } from "./render-scheduler";
var globalScreen = null;
var scheduler = null;
var performanceMonitor = {
  renderCount: 0,
  totalRenderTime: 0,
  lastRenderTime: 0,
  enabled: false
};
function createScreen(options = {}) {
  if (globalScreen) {
    return globalScreen;
  }
  if (!process.stdout.columns || process.stdout.columns === 1 || !process.stdout.rows || process.stdout.rows === 1) {
    process.stdout.columns = 80;
    process.stdout.rows = 24;
  }
  const screenOptions = {
    smartCSR: true,
    title: options.title || "SvelTUI Terminal App",
    fullUnicode: false,
    dockBorders: true,
    autoPadding: true,
    fastCSR: true,
    fullscreen: options.fullscreen === true,
    input: process.stdin,
    keys: true,
    mouse: true,
    useBCE: true,
    width: process.stdout.columns,
    height: process.stdout.rows,
    ...options.blessed
  };
  if (options.debug) {}
  globalScreen = blessed.screen(screenOptions);
  globalScreen.render();
  globalScreen.key(["q", "C-c"], () => {
    process.exit(0);
  });
  globalScreen.on("keypress", (ch, key) => {
    if (options.debug) {}
  });
  globalScreen.enableMouse();
  process.stdin.resume();
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  if (typeof globalScreen.focus === "function") {
    globalScreen.focus();
  }
  scheduler = options.useScheduler !== false ? options.scheduler || globalScheduler : null;
  if (scheduler) {
    scheduler.setRenderCallback((elementIds) => {
      if (globalScreen) {
        const startTime = performanceMonitor.enabled ? performance.now() : 0;
        globalScreen.render();
        if (performanceMonitor.enabled) {
          const renderTime = performance.now() - startTime;
          performanceMonitor.renderCount++;
          performanceMonitor.totalRenderTime += renderTime;
          performanceMonitor.lastRenderTime = renderTime;
        }
      }
    });
    if (options.maxFPS) {
      scheduler.setMaxFPS(options.maxFPS);
    }
  }
  performanceMonitor.enabled = options.debug || options.performanceMonitoring || false;
  if (options.debug) {}
  return globalScreen;
}
function getScreen(options = {}) {
  return globalScreen || createScreen(options);
}
function renderScreen(priority, elementId) {
  if (!globalScreen)
    return;
  if (scheduler) {
    if (elementId) {
      scheduler.scheduleRender(elementId, priority || "normal");
    } else {
      scheduler.scheduleRender("__screen__", priority || "normal");
    }
  } else {
    const startTime = performanceMonitor.enabled ? performance.now() : 0;
    globalScreen.render();
    if (performanceMonitor.enabled) {
      const renderTime = performance.now() - startTime;
      performanceMonitor.renderCount++;
      performanceMonitor.totalRenderTime += renderTime;
      performanceMonitor.lastRenderTime = renderTime;
    }
  }
}
function renderImmediate() {
  if (globalScreen) {
    if (scheduler) {
      scheduler.renderImmediate();
    } else {
      globalScreen.render();
    }
  }
}
function getRenderStats() {
  const schedulerStats = scheduler ? scheduler.stats : null;
  return {
    screen: {
      renderCount: performanceMonitor.renderCount,
      averageRenderTime: performanceMonitor.renderCount > 0 ? performanceMonitor.totalRenderTime / performanceMonitor.renderCount : 0,
      lastRenderTime: performanceMonitor.lastRenderTime,
      totalRenderTime: performanceMonitor.totalRenderTime
    },
    scheduler: schedulerStats
  };
}
function pauseRendering() {
  if (scheduler) {
    scheduler.pause();
  }
}
function resumeRendering() {
  if (scheduler) {
    scheduler.resume();
  }
}
function destroyScreen() {
  if (globalScreen) {
    globalScreen.destroy();
    globalScreen = null;
  }
  if (scheduler) {
    scheduler.clear();
    scheduler = null;
  }
  performanceMonitor = {
    renderCount: 0,
    totalRenderTime: 0,
    lastRenderTime: 0,
    enabled: false
  };
}
function createRootBox(screen, options = {}) {
  const root = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    shrink: false,
    style: {
      fg: "white",
      bg: "black"
    }
  });
  return root;
}
export {
  resumeRendering,
  renderScreen,
  renderImmediate,
  pauseRendering,
  getScreen,
  getRenderStats,
  destroyScreen,
  createScreen,
  createRootBox
};
