/**
 * SvelTUI Direct API Example
 * 
 * This is a direct example using the SvelTUI API without Svelte components
 */

const { render, Box, Text } = require('../src/api/index');

// Create a simple component directly with the API
function SimpleCounter(props = {}) {
  // Mimic a Svelte component with a renderer function
  return function(target) {
    let count = 0;
    
    // Create the main container
    const container = Box({
      border: true,
      label: 'SvelTUI Direct API Demo',
      width: '100%',
      height: '100%'
    });
    
    // Create the counter display
    const counterDisplay = Text({
      content: `Count: ${count}`,
      top: 2,
      left: 'center',
      style: {
        fg: 'green',
        bold: true
      }
    });
    
    // Create increment button
    const incrementButton = Box({
      top: 5,
      left: '30%',
      width: 15,
      height: 3,
      border: true,
      style: {
        border: {
          fg: 'blue'
        }
      }
    });
    
    const incrementText = Text({
      content: ' + ',
      style: {
        fg: 'white',
        bg: 'blue'
      }
    });
    
    // Create decrement button
    const decrementButton = Box({
      top: 5,
      left: '60%',
      width: 15,
      height: 3,
      border: true,
      style: {
        border: {
          fg: 'red'
        }
      }
    });
    
    const decrementText = Text({
      content: ' - ',
      style: {
        fg: 'white',
        bg: 'red'
      }
    });
    
    // Create footer text
    const footerText = Text({
      content: 'Press +/- to change counter | Press q or Ctrl+C to exit',
      bottom: 1,
      left: 'center',
      style: {
        fg: 'gray'
      }
    });
    
    // Build the component tree
    container.appendChild(counterDisplay);
    container.appendChild(incrementButton);
    incrementButton.appendChild(incrementText);
    container.appendChild(decrementButton);
    decrementButton.appendChild(decrementText);
    container.appendChild(footerText);
    
    // Mount to the target
    target.appendChild(container);
    
    // Add event handlers
    incrementButton.addEventListener('click', () => {
      count++;
      counterDisplay.setText(`Count: ${count}`);
    });
    
    decrementButton.addEventListener('click', () => {
      if (count > 0) {
        count--;
        counterDisplay.setText(`Count: ${count}`);
      }
    });
    
    // Handle key events
    target.addEventListener('keypress', (e) => {
      if (e.key === '+') {
        count++;
        counterDisplay.setText(`Count: ${count}`);
      } else if (e.key === '-' && count > 0) {
        count--;
        counterDisplay.setText(`Count: ${count}`);
      }
    });
    
    // Return a cleanup function
    return {
      destroy() {
        // Remove event listeners and cleanup
        incrementButton.removeEventListener('click');
        decrementButton.removeEventListener('click');
        target.removeEventListener('keypress');
      }
    };
  };
}

// Render the component
try {
  console.log('Starting SvelTUI Direct API Example...');
  
  const cleanup = render(SimpleCounter(), {
    title: 'SvelTUI Direct API Demo',
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
  
  // Handle clean exit
  process.on('SIGINT', () => {
    console.log('Received SIGINT, cleaning up...');
    try {
      cleanup();
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
    process.exit(0);
  });
  
  console.log('SvelTUI Direct API Demo started. Press q or Ctrl+C to exit.');
} catch (error) {
  console.error('Error starting SvelTUI Direct API Demo:', error);
  process.exit(1);
}