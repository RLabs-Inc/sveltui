/**
 * Render priority levels
 */
export type RenderPriority = 'immediate' | 'high' | 'normal' | 'low';

/**
 * Render request interface
 */
export interface RenderRequest {
  elementId: string;
  priority: RenderPriority;
  timestamp: number;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  immediate: number;
  high: number;
  normal: number;
  low: number;
  total: number;
  oldestRequest: number | null;
}

/**
 * Render statistics
 */
export interface RenderStats {
  frameCount: number;
  averageFPS: number;
  averageRenderTime: number;
  queuedElements: number;
  isPaused: boolean;
  renderCount: number;
  queueStats: QueueStats;
}

/**
 * Priority-based render queue with coalescing
 */
export class RenderQueue {
  private queues: Map<RenderPriority, Map<string, RenderRequest>>;
  private priorities: RenderPriority[] = ['immediate', 'high', 'normal', 'low'];
  
  constructor() {
    this.queues = new Map();
    this.priorities.forEach(priority => {
      this.queues.set(priority, new Map());
    });
  }
  
  /**
   * Add a render request to the queue
   */
  add(request: RenderRequest): void {
    const queue = this.queues.get(request.priority);
    if (!queue) return;
    
    // Check if element already exists in any queue
    const existingPriority = this.findElement(request.elementId);
    
    if (existingPriority) {
      // Element exists, check if we need to upgrade priority
      const existingIndex = this.priorities.indexOf(existingPriority);
      const newIndex = this.priorities.indexOf(request.priority);
      
      if (newIndex < existingIndex) {
        // Higher priority, move element
        this.remove(request.elementId);
        queue.set(request.elementId, request);
      }
      // Otherwise, keep existing (coalesce)
    } else {
      // New element, add to queue
      queue.set(request.elementId, request);
    }
  }
  
  /**
   * Get next batch of elements to render
   */
  getNextBatch(maxSize: number): RenderRequest[] {
    const batch: RenderRequest[] = [];
    let remaining = maxSize;
    
    for (const priority of this.priorities) {
      if (remaining <= 0) break;
      
      const queue = this.queues.get(priority);
      if (!queue || queue.size === 0) continue;
      
      // Take elements from this priority level
      const elements = Array.from(queue.values())
        .slice(0, remaining)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      batch.push(...elements);
      remaining -= elements.length;
      
      // Remove taken elements
      elements.forEach(req => queue.delete(req.elementId));
    }
    
    return batch;
  }
  
  /**
   * Remove an element from all queues
   */
  remove(elementId: string): boolean {
    for (const queue of this.queues.values()) {
      if (queue.delete(elementId)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Find which priority queue contains an element
   */
  findElement(elementId: string): RenderPriority | null {
    for (const [priority, queue] of this.queues.entries()) {
      if (queue.has(elementId)) {
        return priority;
      }
    }
    return null;
  }
  
  /**
   * Clear all queues
   */
  clear(): void {
    this.queues.forEach(queue => queue.clear());
  }
  
  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const stats: QueueStats = {
      immediate: 0,
      high: 0,
      normal: 0,
      low: 0,
      total: 0,
      oldestRequest: null
    };
    
    let oldestTimestamp = Infinity;
    
    for (const [priority, queue] of this.queues.entries()) {
      const count = queue.size;
      stats[priority] = count;
      stats.total += count;
      
      // Find oldest request
      for (const request of queue.values()) {
        if (request.timestamp < oldestTimestamp) {
          oldestTimestamp = request.timestamp;
        }
      }
    }
    
    if (oldestTimestamp < Infinity) {
      stats.oldestRequest = Date.now() - oldestTimestamp;
    }
    
    return stats;
  }
  
  /**
   * Get all elements in priority order
   */
  getAllElements(): string[] {
    const elements: string[] = [];
    
    for (const priority of this.priorities) {
      const queue = this.queues.get(priority);
      if (queue) {
        elements.push(...queue.keys());
      }
    }
    
    return elements;
  }
  
  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    for (const queue of this.queues.values()) {
      if (queue.size > 0) return false;
    }
    return true;
  }
  
  /**
   * Get total size across all queues
   */
  get size(): number {
    let total = 0;
    for (const queue of this.queues.values()) {
      total += queue.size;
    }
    return total;
  }
}