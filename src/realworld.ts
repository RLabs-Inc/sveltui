#!/usr/bin/env bun
/**
 * SvelTUI Real-World Benchmark Runner
 * Simulates a monitoring dashboard with multiple widgets updating at different rates
 * Run: bun run build && bun --conditions browser dist/src/realworld.mjs
 */

import { mount } from './index.ts'
import { mount as mountComponent } from 'svelte'

import RealWorldBench from './test/RealWorldBench.svelte'

mount(
  () => {
    mountComponent(RealWorldBench, {
      target: document.body,
    })
  },
  { fullscreen: true }
)
