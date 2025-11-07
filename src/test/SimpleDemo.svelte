<script>
  import Box from '../components/Box.svelte'
  import Text from '../components/Text.svelte'
  
  let count = $state(0)
  
  setInterval(() => {
    count++
  }, 1000)
</script>

<Box 
  width={80}
  height={10}
  border="single"
  borderColor="cyan"
  padding={1}
  flexDirection="column"
  gap={1}
>
  <Text text="🎉 Simplified Layout System Working!" color="green" bold={true} />
  <Text text={`Count: ${count}`} color="yellow" />
  
  <Box
    flexDirection="row"
    gap={2}
    marginY={1}
  >
    <Box
      border="rounded"
      borderColor="blue"
      padding={1}
      flexGrow={1}
    >
      <Text text="Box 1" color="blue" />
    </Box>
    
    <Box
      border="double"
      borderColor="magenta"
      padding={1}
      flexGrow={1}
    >
      <Text text="Box 2" color="magenta" />
    </Box>
  </Box>
  
  <Text text="Press Ctrl+C to exit" color="gray" dim={true} />
</Box>