// Test if we can import client-side Svelte directly
import { mount } from 'svelte/src/index-client.js';

console.log('mount function type:', typeof mount);
console.log('mount function:', mount.toString().substring(0, 100));