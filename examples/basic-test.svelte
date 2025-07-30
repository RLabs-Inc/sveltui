<script>
  import Box from '../src/components/ui/Box.svelte.mjs';
  import Text from '../src/components/ui/Text.svelte.mjs';
  
  let { title = 'Basic Test' } = $props();
</script>

<Box border width="50%" height="50%" label={title}>
  <Text bold fg="green" content="✓ SvelTUI is working!" />
  <Text fg="cyan" content="This is a simple Box with Text component." />
  <Text fg="yellow" content="If you can see this, the basic components are rendering correctly." />
</Box>