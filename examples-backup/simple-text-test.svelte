<script>
  import Box from '../src/components/ui/Box.svelte.mjs';
  import Text from '../src/components/ui/Text.svelte.mjs';
</script>

<Box border width="50%" height="10" label="Simple Text Test">
  <Text content="Direct content test" fg="green" />
  <Text fg="cyan">Child content test</Text>
</Box>