<!--
  Simple Two-Way Binding Test
  
  Tests basic two-way binding functionality
-->

<script>
  import { Box, Text, Input, Checkbox } from '../src/components/ui/index.ts';
  
  // Test state
  let inputValue = $state('Hello SvelTUI!');
  let isChecked = $state(false);
  
  // Derived values to show reactivity
  let uppercaseValue = $derived(inputValue.toUpperCase());
  let characterCount = $derived(inputValue.length);
</script>

<Box width="100%" height="100%" border="line" label=" Simple Binding Test ">
  <Text left={1} top={1} bold>Input Test:</Text>
  
  <!-- Input with bind:value -->
  <Input 
    bind:value={inputValue}
    left={1} 
    top={3} 
    width={30} 
    height={1}
    border
    placeholder="Type something..."
  />
  
  <!-- Display bound value -->
  <Text left={1} top={5}>Current value: {inputValue}</Text>
  <Text left={1} top={6}>Uppercase: {uppercaseValue}</Text>
  <Text left={1} top={7}>Length: {characterCount} characters</Text>
  
  <!-- Checkbox with bind:checked -->
  <Checkbox 
    bind:checked={isChecked}
    left={1} 
    top={9}
    label="Toggle me"
  />
  
  <!-- Display checkbox state -->
  <Text left={1} top={11}>Checkbox is: {isChecked ? 'CHECKED' : 'unchecked'}</Text>
  
  <Text left={1} bottom={1} fg="cyan">Press Tab to switch focus, Enter to submit input, Space to toggle checkbox</Text>
</Box>