import blessed from 'blessed';

// Create a screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Blessed Test'
});

// Create a box
const box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: 'Hello from blessed!',
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'cyan'
    }
  }
});

// Add box to screen
screen.append(box);

// Key handler
screen.key(['q', 'C-c'], () => {
  process.exit(0);
});

// Render
screen.render();

console.log('Blessed test running. Press q to quit.');