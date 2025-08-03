#!/usr/bin/env bun

/**
 * Direct test of the render scheduler without Svelte components
 */

import blessed from 'blessed';
import { RenderScheduler } from '../src/renderer/render-scheduler';

// Create a blessed screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Render Scheduler Direct Test'
});

// Create some boxes to update
const boxes = [];
for (let i = 0; i < 4; i++) {
  const box = blessed.box({
    parent: screen,
    top: i * 3,
    left: 0,
    width: '50%',
    height: 3,
    border: { type: 'line' },
    content: `Box ${i}: 0`
  });
  boxes.push(box);
}

// Create stats box
const statsBox = blessed.box({
  parent: screen,
  top: 0,
  left: '50%',
  width: '50%',
  height: '100%',
  border: { type: 'line' },
  label: ' Stats ',
  content: 'Initializing...'
});

// Create scheduler with render callback
const scheduler = new RenderScheduler((elementIds) => {
  // Render the screen when scheduler says to
  screen.render();
});

// Counter values
const counters = [0, 0, 0, 0];
const intervals = [16, 50, 100, 200]; // Different update rates
const priorities = ['high', 'normal', 'normal', 'low'];

// Start updating boxes
intervals.forEach((interval, i) => {
  setInterval(() => {
    counters[i]++;
    boxes[i].setContent(`Box ${i}: ${counters[i]} (${priorities[i]} priority)`);
    // Schedule render with priority
    scheduler.scheduleRender(`box${i}`, priorities[i] as any);
  }, interval);
});

// Update stats
setInterval(() => {
  const stats = scheduler.stats;
  statsBox.setContent(
    `Frame Count: ${stats.frameCount}\n` +
    `Average FPS: ${stats.averageFPS}\n` +
    `Avg Render Time: ${stats.averageRenderTime}ms\n` +
    `Queued Elements: ${stats.queuedElements}\n` +
    `Render Count: ${stats.renderCount}\n` +
    `\nQueue Stats:\n` +
    `Immediate: ${stats.queueStats.immediate}\n` +
    `High: ${stats.queueStats.high}\n` +
    `Normal: ${stats.queueStats.normal}\n` +
    `Low: ${stats.queueStats.low}\n` +
    `Total: ${stats.queueStats.total}`
  );
}, 100);

// Handle exit
screen.key(['q', 'C-c'], () => {
  process.exit(0);
});

// Initial render
screen.render();

console.log('Render Scheduler Direct Test');
console.log('Press Q to quit');
console.log('');
console.log('This test shows the scheduler batching renders efficiently.');