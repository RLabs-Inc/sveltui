#!/usr/bin/env bun
/**
 * SvelTUI Stress Test Runner
 * Run: bun run stress
 */

import { mount } from './index.ts'
import { mount as mountComponent } from 'svelte'

import StressTest from './test/StressTest.svelte'

mount(
  () => {
    mountComponent(StressTest, {
      target: document.body,
    })
  },
  { fullscreen: false }
)
