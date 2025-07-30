import { render } from '../src/renderer';

const cleanup = render('examples/simple-text-test.svelte.mjs', { 
  title: 'Simple Text Test',
  fullscreen: false,
  debug: true
});

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});