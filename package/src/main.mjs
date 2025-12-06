#!/usr/bin/env bun
// @bun

// src/main.ts
import { mount } from './index.mjs';
import { mount as mountComponent } from "svelte";
import ResizeDemo from './test/ResizeDemo.svelte.mjs';
mount(() => {
  mountComponent(ResizeDemo, {
    target: document.body
  });
}, { fullscreen: false });
