// @bun
// src/renderer/render-scheduler.ts
import { flushSync } from "svelte";
import { RenderQueue } from "./render-queue";

class RenderScheduler {
  dirtyElements = new Set;
  isScheduled = false;
  isPaused = false;
  frameCount = 0;
  lastFrameTime = 0;
  totalRenderTime = 0;
  renderCount = 0;
  queue = new RenderQueue;
  maxFPS = 60;
  frameInterval = 1000 / this.maxFPS;
  lastRenderTime = 0;
  renderCallback = null;
  constructor(renderCallback) {
    if (renderCallback) {
      this.renderCallback = renderCallback;
    }
  }
  get stats() {
    return {
      frameCount: this.frameCount,
      averageFPS: this.frameCount > 0 ? Math.round(this.frameCount / (this.totalRenderTime / 1000)) : 0,
      averageRenderTime: this.renderCount > 0 ? Math.round(this.totalRenderTime / this.renderCount) : 0,
      queuedElements: this.dirtyElements.size,
      isPaused: this.isPaused,
      renderCount: this.renderCount,
      queueStats: this.queue.getStats()
    };
  }
  scheduleRender(elementId, priority = "normal") {
    if (this.isPaused)
      return;
    this.queue.add({
      elementId,
      priority,
      timestamp: Date.now()
    });
    this.dirtyElements.add(elementId);
    if (!this.isScheduled) {
      this.isScheduled = true;
      this.scheduleFrame();
    }
  }
  scheduleBatch(elementIds, priority = "normal") {
    if (this.isPaused)
      return;
    elementIds.forEach((id) => {
      this.queue.add({
        elementId: id,
        priority,
        timestamp: Date.now()
      });
      this.dirtyElements.add(id);
    });
    if (!this.isScheduled) {
      this.isScheduled = true;
      this.scheduleFrame();
    }
  }
  renderImmediate(elementId) {
    const startTime = performance.now();
    if (elementId) {
      const elements = new Set([elementId]);
      this.executeRender(elements);
    } else {
      this.processFrame();
    }
    const renderTime = performance.now() - startTime;
    this.totalRenderTime += renderTime;
    this.renderCount++;
  }
  pause() {
    this.isPaused = true;
  }
  resume() {
    this.isPaused = false;
    if (this.dirtyElements.size > 0) {
      this.scheduleFrame();
    }
  }
  clear() {
    this.dirtyElements.clear();
    this.queue.clear();
    this.isScheduled = false;
  }
  setRenderCallback(callback) {
    this.renderCallback = callback;
  }
  setMaxFPS(fps) {
    this.maxFPS = Math.max(1, Math.min(120, fps));
    this.frameInterval = 1000 / this.maxFPS;
  }
  resetStats() {
    this.frameCount = 0;
    this.totalRenderTime = 0;
    this.renderCount = 0;
    this.lastFrameTime = Date.now();
  }
  scheduleFrame() {
    const now = Date.now();
    const timeSinceLastRender = now - this.lastRenderTime;
    if (timeSinceLastRender >= this.frameInterval) {
      queueMicrotask(() => this.processFrame());
    } else {
      const delay = this.frameInterval - timeSinceLastRender;
      setTimeout(() => {
        queueMicrotask(() => this.processFrame());
      }, delay);
    }
  }
  processFrame() {
    if (this.isPaused || this.dirtyElements.size === 0) {
      this.isScheduled = false;
      return;
    }
    const startTime = performance.now();
    const toRender = this.queue.getNextBatch(this.maxFPS === 60 ? 100 : 50);
    const elementIds = new Set(toRender.map((r) => r.elementId));
    flushSync(() => {
      this.executeRender(elementIds);
    });
    const renderTime = performance.now() - startTime;
    this.totalRenderTime += renderTime;
    this.renderCount++;
    this.frameCount++;
    this.lastRenderTime = Date.now();
    elementIds.forEach((id) => this.dirtyElements.delete(id));
    if (this.dirtyElements.size > 0) {
      this.scheduleFrame();
    } else {
      this.isScheduled = false;
    }
  }
  executeRender(elementIds) {
    if (this.renderCallback && elementIds.size > 0) {
      this.renderCallback(elementIds);
    }
  }
}
var globalScheduler = new RenderScheduler;
export {
  globalScheduler,
  RenderScheduler
};
