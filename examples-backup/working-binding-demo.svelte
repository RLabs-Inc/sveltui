<!--
  Working Binding Demo
  
  A simple demo that should display and stay on screen
-->

<script>
  import Box from '../src/components/ui/Box.svelte.mjs';
  import Text from '../src/components/ui/Text.svelte.mjs';
  import Input from '../src/components/ui/Input.svelte.mjs';
  
  // State for binding
  let inputValue = $state('Hello SvelTUI!');
</script>

<Box width="100%" height="100%" border="line" label=" Binding Demo ">
  <Text left={1} top={1} bold>Input Binding Test</Text>
  
  <Text left={1} top={3}>Enter text:</Text>
  <Input 
    bind:value={inputValue}
    left={12} 
    top={3} 
    width={30} 
    height={1}
    border
  />
  
  <Text left={1} top={5}>You typed: {inputValue}</Text>
  
  <Text left={1} bottom={1} fg="cyan">Press q to quit</Text>
</Box>