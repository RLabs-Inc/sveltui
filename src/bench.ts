#!/usr/bin/env bun
/**
 * SvelTUI Benchmark Runner
 * Run: bun run build && bun --conditions browser dist/src/bench.mjs
 */

import { mount } from './index.ts'
import { mount as mountComponent } from 'svelte'

import Benchmark from './test/Benchmark.svelte'

mount(
  () => {
    mountComponent(Benchmark, {
      target: document.body,
    })
  },
  { fullscreen: false }
)
