import { render } from '../src/renderer';

// Launch the scrollable list test example
const cleanup = render('examples/scrollable-list-test.svelte.mjs', { 
  title: 'ScrollableList Test',
  fullscreen: false,
  debug: true
});

// Exit on Ctrl+C
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});