#!/usr/bin/env bun
// Import mount from index.ts - this ensures Happy DOM is registered
import { mount } from './index.ts'
import { mount as mountComponent } from 'svelte'

import ComprehensiveLayoutDemo from './test/ComprehensiveLayoutDemo.svelte'
import FocusScrollDemo from './test/FocusScrollDemo.svelte'
import ComplexScrollDemo from './test/ComplexScrollDemo.svelte'
import ResizeDemo from './test/ResizeDemo.svelte'

mount(
  () => {
    mountComponent(ResizeDemo, {
      target: document.body,
    })
  },
  { fullscreen: false }
)
