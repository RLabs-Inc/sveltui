#!/usr/bin/env bun

/**
 * Render Scheduler Demo Launcher
 * 
 * This demo showcases the efficiency of SvelTUI's render scheduler
 * by running multiple counters with different update frequencies.
 * 
 * Run with: bun --conditions browser examples/render-scheduler-launcher.ts
 */

import { createRenderer } from '../src/index'
import RenderSchedulerDemo from './render-scheduler-demo.svelte.mjs'

async function main() {
  console.log('Starting Render Scheduler Demo...')
  console.log('This demo shows how the scheduler batches renders for efficiency.')
  console.log('Press Q to quit.')
  
  // Create renderer with scheduler enabled (default)
  const renderer = createRenderer({
    title: 'SvelTUI Render Scheduler Demo',
    fullscreen: true,
    debug: false,
    performanceMonitoring: true,
    useScheduler: true,  // Enable scheduler (default)
    maxFPS: 60          // Limit to 60 FPS
  })
  
  // Mount the demo component
  const cleanup = renderer.mount(RenderSchedulerDemo, {})
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\nShutting down...')
    cleanup()
    process.exit(0)
  })
}

main().catch(console.error)