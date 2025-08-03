<script>
  import Box from '../src/components/ui/Box.svelte.mjs';
  import Text from '../src/components/ui/Text.svelte.mjs';
  import TextInput from '../src/components/ui/TextInput.svelte.mjs';
  
  let { title = 'TextInput Test' } = $props();
  let inputValue = $state('');
  let submitted = $state(false);
  
  function handleSubmit() {
    submitted = true;
  }
</script>

<Box border width="80%" height="50%" label={title}>
  <Text top={0} left="center" bold fg="cyan" content="TextInput Component Test" />
  <Text top={2} left={2} fg="white" content="Type something and press Enter:" />
  
  <TextInput 
    top={4}
    left={2}
    width="90%"
    bind:value={inputValue}
    onSubmit={handleSubmit}
    placeholder="Type here..."
    focused={true}
  />
  
  <Text top={6} left={2} fg="yellow" content={`Current value: ${inputValue || '(empty)'}`} />
  
  {#if submitted}
    <Text top={8} left={2} bold fg="green" content={`✓ You submitted: ${inputValue}`} />
  {/if}
</Box>