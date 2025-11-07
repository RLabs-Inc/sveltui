#!/usr/bin/env bun
// ============================================================================
// SVELTUI - TEST RUNNER
// Mounts the TestApp Svelte component and runs it
// ============================================================================

// Register Happy DOM globals FIRST - before any Svelte imports
import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()

import { mount } from '../mount.svelte.ts'
import { mount as mountComponent } from 'svelte'
import TestApp from './TestApp.svelte'

mount(
  () => {
    const app = mountComponent(TestApp, {
      target: document.body,
    })
  },
  { fullscreen: true }
)
