/**
 * SvelTUI Minimal Demo
 * 
 * A basic demonstration of SvelTUI capabilities with minimal components
 */

<script lang="ts">
  import Box from '../src/components/ui/Box.svelte';
  import Text from '../src/components/ui/Text.svelte';
  
  // State with Svelte 5 runes
  let count = $state(0);
  let message = $state('Welcome to SvelTUI!');
  
  // Derived state
  $effect(() => {
    message = `Count: ${count} - Welcome to SvelTUI!`;
  });
  
  // Event handler
  function incrementCount() {
    count++;
  }
</script>

<Box border label="SvelTUI Minimal Demo" width="100%" height="100%">
  <Box top={1} left={2} width="95%" height={3}>
    <Text content={message} style={{ fg: 'green', bold: true }} />
  </Box>
  
  <Box top={5} left="center" width={20} height={3} border>
    <Text 
      content=" Increment Count " 
      style={{ fg: 'white', bg: 'blue' }}
      onclick={incrementCount}
    />
  </Box>
  
  <Box top={10} left={2} width="95%" height={1}>
    <Text content={`The current count is: ${count}`} />
  </Box>
  
  <Box bottom={1} left="center" width="95%" height={1}>
    <Text content="Press Q to quit | Use mouse click to increment counter" style={{ fg: 'gray' }} />
  </Box>
</Box>