<script>
  import Box from '../src/components/ui/Box.svelte'
  import Text from '../src/components/ui/Text.svelte'
  import List from '../src/components/ui/List.svelte'
  
  let count = $state(0)
  let items = $state(['Option 1', 'Option 2', 'Option 3'])
  let selected = $state(0)
  
  // Auto-increment counter every second
  $effect(() => {
    const interval = setInterval(() => {
      count++
    }, 1000)
    
    return () => clearInterval(interval)
  })
</script>

<Box width="100%" height="100%" border label="🎉 SvelTUI is WORKING!">
  <Box top={1} left={2} width="90%" height={3} border>
    <Text content={`Counter: ${count}`} style={{ fg: 'green', bold: true }} />
  </Box>
  
  <Box top={5} left={2} width="90%" height={8} border label="Select an option">
    <List 
      items={items} 
      selected={selected}
      style={{ 
        selected: { bg: 'blue', fg: 'white' }
      }}
    />
  </Box>
  
  <Box bottom={0} left={2} width="90%" height={3}>
    <Text content="Press Q to exit | Arrow keys to navigate" style={{ fg: 'gray' }} />
  </Box>
</Box>