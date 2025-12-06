// @bun
// src/renderer/render-queue.ts
class RenderQueue {
  queues;
  priorities = ["immediate", "high", "normal", "low"];
  constructor() {
    this.queues = new Map;
    this.priorities.forEach((priority) => {
      this.queues.set(priority, new Map);
    });
  }
  add(request) {
    const queue = this.queues.get(request.priority);
    if (!queue)
      return;
    const existingPriority = this.findElement(request.elementId);
    if (existingPriority) {
      const existingIndex = this.priorities.indexOf(existingPriority);
      const newIndex = this.priorities.indexOf(request.priority);
      if (newIndex < existingIndex) {
        this.remove(request.elementId);
        queue.set(request.elementId, request);
      }
    } else {
      queue.set(request.elementId, request);
    }
  }
  getNextBatch(maxSize) {
    const batch = [];
    let remaining = maxSize;
    for (const priority of this.priorities) {
      if (remaining <= 0)
        break;
      const queue = this.queues.get(priority);
      if (!queue || queue.size === 0)
        continue;
      const elements = Array.from(queue.values()).slice(0, remaining).sort((a, b) => a.timestamp - b.timestamp);
      batch.push(...elements);
      remaining -= elements.length;
      elements.forEach((req) => queue.delete(req.elementId));
    }
    return batch;
  }
  remove(elementId) {
    for (const queue of this.queues.values()) {
      if (queue.delete(elementId)) {
        return true;
      }
    }
    return false;
  }
  findElement(elementId) {
    for (const [priority, queue] of this.queues.entries()) {
      if (queue.has(elementId)) {
        return priority;
      }
    }
    return null;
  }
  clear() {
    this.queues.forEach((queue) => queue.clear());
  }
  getStats() {
    const stats = {
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
  getAllElements() {
    const elements = [];
    for (const priority of this.priorities) {
      const queue = this.queues.get(priority);
      if (queue) {
        elements.push(...queue.keys());
      }
    }
    return elements;
  }
  isEmpty() {
    for (const queue of this.queues.values()) {
      if (queue.size > 0)
        return false;
    }
    return true;
  }
  get size() {
    let total = 0;
    for (const queue of this.queues.values()) {
      total += queue.size;
    }
    return total;
  }
}
export {
  RenderQueue
};
