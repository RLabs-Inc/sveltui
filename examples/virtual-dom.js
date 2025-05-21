/**
 * SvelTUI Virtual DOM Example
 * 
 * This is a direct example using the SvelTUI Virtual DOM without Svelte
 */

// Import DOM related functions directly
const { 
  document,
  createElement, 
  createTextNode
} = require('../src/dom');

// Import screen and blessed setup
const blessed = require('blessed');
const { getScreen } = require('../src/renderer/screen');

try {
  console.log('Starting SvelTUI Virtual DOM Example...');
  
  // Create a screen
  const screen = getScreen({
    title: 'SvelTUI Virtual DOM Demo',
    fullscreen: true,
    debug: true,
    blessed: {
      fullUnicode: false,
      smartCSR: true,
      fastCSR: true,
      forceUnicode: false,
      useBCE: true
    }
  });
  
  // Create a root box
  const rootBox = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  });
  
  // Function to create our UI
  function createUI() {
    // Create main container
    const container = document.createElement('box');
    container.setAttribute('border', 'line');
    container.setAttribute('label', 'SvelTUI Virtual DOM Demo');
    container.setAttribute('width', '100%');
    container.setAttribute('height', '100%');
    
    // Add counter display
    let count = 0;
    const counterDisplay = document.createElement('text');
    counterDisplay.setAttribute('top', 2);
    counterDisplay.setAttribute('left', 'center');
    counterDisplay.setAttribute('content', `Count: ${count}`);
    counterDisplay.style = {
      fg: 'green',
      bold: true
    };
    
    // Create increment button
    const incrementButton = document.createElement('box');
    incrementButton.setAttribute('top', 5);
    incrementButton.setAttribute('left', '30%');
    incrementButton.setAttribute('width', 15);
    incrementButton.setAttribute('height', 3);
    incrementButton.setAttribute('border', 'line');
    incrementButton.style = {
      border: {
        fg: 'blue'
      }
    };
    
    const incrementText = document.createElement('text');
    incrementText.setAttribute('content', ' + ');
    incrementText.style = {
      fg: 'white',
      bg: 'blue'
    };
    
    // Create decrement button
    const decrementButton = document.createElement('box');
    decrementButton.setAttribute('top', 5);
    decrementButton.setAttribute('left', '60%');
    decrementButton.setAttribute('width', 15);
    decrementButton.setAttribute('height', 3);
    decrementButton.setAttribute('border', 'line');
    decrementButton.style = {
      border: {
        fg: 'red'
      }
    };
    
    const decrementText = document.createElement('text');
    decrementText.setAttribute('content', ' - ');
    decrementText.style = {
      fg: 'white',
      bg: 'red'
    };
    
    // Create footer text
    const footerText = document.createElement('text');
    footerText.setAttribute('bottom', 1);
    footerText.setAttribute('left', 'center');
    footerText.setAttribute('content', 'Press +/- to change counter | Press q or Ctrl+C to exit');
    footerText.style = {
      fg: 'gray'
    };
    
    // Build the component tree
    container.appendChild(counterDisplay);
    incrementButton.appendChild(incrementText);
    container.appendChild(incrementButton);
    decrementButton.appendChild(decrementText);
    container.appendChild(decrementButton);
    container.appendChild(footerText);
    
    // Add event handlers
    incrementButton.addEventListener('click', () => {
      count++;
      counterDisplay.setAttribute('content', `Count: ${count}`);
      screen.render();
    });
    
    decrementButton.addEventListener('click', () => {
      if (count > 0) {
        count--;
        counterDisplay.setAttribute('content', `Count: ${count}`);
        screen.render();
      }
    });
    
    // Add the container to the document body
    document.body.appendChild(container);
    
    // Create connection to terminal elements
    document._terminalElement.attachToDom(rootBox);
    screen.render();
    
    // Add key events
    screen.key(['+'], () => {
      count++;
      counterDisplay.setAttribute('content', `Count: ${count}`);
      screen.render();
    });
    
    screen.key(['-'], () => {
      if (count > 0) {
        count--;
        counterDisplay.setAttribute('content', `Count: ${count}`);
        screen.render();
      }
    });
    
    // Add quit handler
    screen.key(['q', 'C-c'], () => {
      screen.destroy();
      process.exit(0);
    });
  }
  
  // Create the UI
  createUI();
  
  // Handle clean exit
  process.on('SIGINT', () => {
    console.log('Received SIGINT, cleaning up...');
    try {
      screen.destroy();
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
    process.exit(0);
  });
  
  console.log('SvelTUI Virtual DOM Demo started. Press q or Ctrl+C to exit.');
} catch (error) {
  console.error('Error starting SvelTUI Virtual DOM Demo:', error);
  process.exit(1);
}