import { flushSync } from 'svelte';
import type { RenderPriority, RenderRequest, RenderStats } from './render-queue';
import { RenderQueue } from './render-queue';

export class RenderScheduler {
  // State for tracking dirty elements
  private dirtyElements = new Set<string>();
  private isScheduled = false;
  private isPaused = false;
  
  // Performance tracking state
  private frameCount = 0;
  private lastFrameTime = 0;
  private totalRenderTime = 0;
  private renderCount = 0;
  
  // Render queue
  private queue = new RenderQueue();
  
  // Configuration
  private maxFPS = 60;
  private frameInterval = 1000 / this.maxFPS;
  private lastRenderTime = 0;
  
  // Callbacks
  private renderCallback: ((elementIds: Set<string>) => void) | null = null;
  
  constructor(renderCallback?: (elementIds: Set<string>) => void) {
    if (renderCallback) {
      this.renderCallback = renderCallback;
    }
  }
  
  /**
   * Get current statistics
   */
  get stats(): RenderStats {
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
  
  /**
   * Schedule a render for an element
   */
  scheduleRender(elementId: string, priority: RenderPriority = 'normal'): void {
    if (this.isPaused) return;
    
    // Add to queue
    this.queue.add({
      elementId,
      priority,
      timestamp: Date.now()
    });
    
    // Track as dirty
    this.dirtyElements.add(elementId);
    
    // Schedule frame if not already scheduled
    if (!this.isScheduled) {
      this.isScheduled = true;
      this.scheduleFrame();
    }
  }
  
  /**
   * Schedule multiple renders at once
   */
  scheduleBatch(elementIds: string[], priority: RenderPriority = 'normal'): void {
    if (this.isPaused) return;
    
    elementIds.forEach(id => {
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
  
  /**
   * Force immediate render (bypasses scheduling)
   */
  renderImmediate(elementId?: string): void {
    const startTime = performance.now();
    
    if (elementId) {
      // Render specific element
      const elements = new Set([elementId]);
      this.executeRender(elements);
    } else {
      // Render all dirty elements
      this.processFrame();
    }
    
    const renderTime = performance.now() - startTime;
    this.totalRenderTime += renderTime;
    this.renderCount++;
  }
  
  /**
   * Pause rendering
   */
  pause(): void {
    this.isPaused = true;
  }
  
  /**
   * Resume rendering
   */
  resume(): void {
    this.isPaused = false;
    if (this.dirtyElements.size > 0) {
      this.scheduleFrame();
    }
  }
  
  /**
   * Clear all pending renders
   */
  clear(): void {
    this.dirtyElements.clear();
    this.queue.clear();
    this.isScheduled = false;
  }
  
  /**
   * Set render callback
   */
  setRenderCallback(callback: (elementIds: Set<string>) => void): void {
    this.renderCallback = callback;
  }
  
  /**
   * Set maximum FPS
   */
  setMaxFPS(fps: number): void {
    this.maxFPS = Math.max(1, Math.min(120, fps));
    this.frameInterval = 1000 / this.maxFPS;
  }
  
  /**
   * Reset performance stats
   */
  resetStats(): void {
    this.frameCount = 0;
    this.totalRenderTime = 0;
    this.renderCount = 0;
    this.lastFrameTime = Date.now();
  }
  
  /**
   * Schedule a frame using appropriate method
   */
  private scheduleFrame(): void {
    const now = Date.now();
    const timeSinceLastRender = now - this.lastRenderTime;
    
    if (timeSinceLastRender >= this.frameInterval) {
      // Enough time has passed, render immediately
      queueMicrotask(() => this.processFrame());
    } else {
      // Schedule for next available frame
      const delay = this.frameInterval - timeSinceLastRender;
      setTimeout(() => {
        queueMicrotask(() => this.processFrame());
      }, delay);
    }
  }
  
  /**
   * Process a render frame
   */
  private processFrame(): void {
    if (this.isPaused || this.dirtyElements.size === 0) {
      this.isScheduled = false;
      return;
    }
    
    const startTime = performance.now();
    
    // Get elements to render based on priority
    const toRender = this.queue.getNextBatch(this.maxFPS === 60 ? 100 : 50);
    const elementIds = new Set(toRender.map(r => r.elementId));
    
    // Execute render with Svelte flush
    flushSync(() => {
      this.executeRender(elementIds);
    });
    
    // Update stats
    const renderTime = performance.now() - startTime;
    this.totalRenderTime += renderTime;
    this.renderCount++;
    this.frameCount++;
    this.lastRenderTime = Date.now();
    
    // Clear rendered elements
    elementIds.forEach(id => this.dirtyElements.delete(id));
    
    // Schedule next frame if needed
    if (this.dirtyElements.size > 0) {
      this.scheduleFrame();
    } else {
      this.isScheduled = false;
    }
  }
  
  /**
   * Execute render callback
   */
  private executeRender(elementIds: Set<string>): void {
    if (this.renderCallback && elementIds.size > 0) {
      this.renderCallback(elementIds);
    }
  }
}

// Global scheduler instance
export const globalScheduler = new RenderScheduler();