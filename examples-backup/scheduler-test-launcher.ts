#!/usr/bin/env bun

import { createRenderer } from '../src/api/index'
import SchedulerTest from './scheduler-test.svelte.mjs'

async function main() {
  console.log('Starting Scheduler Test...')
  
  // Create renderer with scheduler enabled
  const renderer = createRenderer({
    title: 'Scheduler Test',
    fullscreen: false,
    performanceMonitoring: true,
    useScheduler: true,
    maxFPS: 60
  })
  
  // Mount component
  const cleanup = renderer.mount(SchedulerTest, {})
  
  // Log performance stats every 2 seconds
  setInterval(() => {
    const stats = renderer.getRenderStats?.();
    if (stats?.scheduler) {
      console.log('Scheduler Stats:', {
        fps: stats.scheduler.averageFPS,
        renderCount: stats.scheduler.renderCount,
        avgRenderTime: stats.scheduler.averageRenderTime
      });
    }
  }, 2000);
  
  process.on('SIGINT', () => {
    console.log('\nShutting down...')
    cleanup()
    process.exit(0)
  })
}

main().catch(console.error)