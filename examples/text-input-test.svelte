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
  <Text bold fg="cyan" content="TextInput Component Test" />
  <Text fg="white" content="Type something and press Enter:" />
  
  <TextInput 
    bind:value={inputValue}
    onSubmit={handleSubmit}
    placeholder="Type here..."
    focused={true}
  />
  
  <Text fg="yellow" content={`Current value: ${inputValue || '(empty)'}`} />
  
  {#if submitted}
    <Text bold fg="green" content={`✓ You submitted: ${inputValue}`} />
  {/if}
</Box>