<script>
  import Box from '../src/components/ui/Box.svelte.mjs';
  import Text from '../src/components/ui/Text.svelte.mjs';
  import ScrollableList from '../src/components/ui/ScrollableList.svelte.mjs';
  
  let { title = 'ScrollableList Test' } = $props();
  
  // Generate test items
  const items = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    label: `Item ${i + 1}`,
    description: `This is item number ${i + 1}`
  }));
  
  let selectedIndex = $state(0);
  let selectedItem = $state(null);
  
  function handleSelect(index) {
    selectedIndex = index;
    selectedItem = items[index];
  }
</script>

<Box border width="80%" height="80%" label={title}>
  <Text bold fg="cyan" content="ScrollableList Component Test" />
  <Text fg="white" content="Use arrow keys to navigate, Enter to select:" />
  
  <Box height="50%" border>
    <ScrollableList 
      items={items.map(item => item.label)}
      selected={selectedIndex}
      onSelect={handleSelect}
      focused={true}
    />
  </Box>
  
  <Box height="20%" border label="Selection Info">
    <Text fg="yellow" content={`Selected Index: ${selectedIndex}`} />
    {#if selectedItem}
      <Text fg="green" content={`Selected: ${selectedItem.label}`} />
      <Text fg="white" content={selectedItem.description} />
    {/if}
  </Box>
</Box>