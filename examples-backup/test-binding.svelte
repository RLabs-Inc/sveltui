<!--
  Test Binding - Simple test with Input component
-->

<script>
  import { Box, Text, Input } from '../src/components/ui/index.ts';
  
  // Simple bindable value
  let inputValue = $state('Type here...');
  
  // Handler for key events
  function handleKeydown(event) {
    if (event.key === 'q') {
      console.log('Quitting...');
      process.exit(0);
    }
  }
</script>

<Box 
  width="100%" 
  height="100%" 
  border="line"
  label=" Input Binding Test "
  onkeydown={handleKeydown}
  keys={true}
  focusable={true}
>
  <Text left={1} top={1} bold>Enter some text:</Text>
  
  <Input 
    bind:value={inputValue}
    left={1} 
    top={3} 
    width="50%" 
    height={1}
    border
    focusable={true}
    keys={true}
  />
  
  <Text left={1} top={5}>You typed: {inputValue}</Text>
  
  <Text left={1} bottom={1} fg="cyan">Press Tab to focus input, Enter to submit, q to quit</Text>
</Box>