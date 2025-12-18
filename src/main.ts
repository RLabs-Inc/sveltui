#!/usr/bin/env bun
// Import mount from index.ts - this ensures Happy DOM is registered
import { mount } from './index.ts'
import { mount as mountComponent } from 'svelte'

import AppendModeDemo from './test/AppendModeDemo.svelte'

mount(
  () => {
    mountComponent(AppendModeDemo, {
      target: document.body,
    })
  },
  { append: true } // Testing new append mode!
)
