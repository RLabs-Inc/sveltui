#!/usr/bin/env bun
// @bun

// src/test/debug-render.ts
import { mount } from '../index.mjs';
import { mount as mountComponent } from "svelte";
import { terminalSize, contentHeight } from '../core/state/engine.svelte.js';
import ComplexScrollDemo from './ComplexScrollDemo.svelte.mjs';
console.log("Starting debug render...");
console.log(`Terminal: ${process.stdout.columns}x${process.stdout.rows}`);
mount(() => {
  mountComponent(ComplexScrollDemo, {
    target: document.body
  });
  setTimeout(() => {
    console.log(`

Dimensions after mount:`);
    console.log(`Terminal size in engine: ${terminalSize.width}x${terminalSize.height}`);
    console.log(`Content height: ${contentHeight.value}`);
    console.log(`Fullscreen mode: ${terminalSize.fullscreen}`);
  }, 100);
}, { fullscreen: false });
