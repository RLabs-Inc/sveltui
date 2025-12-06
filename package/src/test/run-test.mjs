#!/usr/bin/env bun
// @bun

// src/test/run-test.ts
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { mount } from '../mount.svelte.js';
import { mount as mountComponent } from "svelte";
import TestApp from './TestApp.svelte.mjs';
GlobalRegistrator.register();
mount(() => {
  const app = mountComponent(TestApp, {
    target: document.body
  });
}, { fullscreen: true });
