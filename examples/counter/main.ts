#!/usr/bin/env bun
import { mount } from '../../src/index.ts'
import { mount as mountComponent } from 'svelte'
import Counter from './Counter.svelte'

// Mount the counter app
mount(
  () => {
    mountComponent(Counter, {
      target: document.body,
    })
  },
  { fullscreen: false }
)
