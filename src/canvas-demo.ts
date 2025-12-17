#!/usr/bin/env bun
/**
 * SvelTUI Canvas Demo Runner
 * Run: bun run build && bun --conditions browser dist/src/canvas-demo.mjs
 */

import { mount } from './index.ts'
import { mount as mountComponent } from 'svelte'

import CanvasDemo from './test/CanvasDemo.svelte'

mount(
  () => {
    mountComponent(CanvasDemo, {
      target: document.body,
    })
  },
  { fullscreen: true }
)
