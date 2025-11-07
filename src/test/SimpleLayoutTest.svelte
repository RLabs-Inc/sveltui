<script>
  import Box from '../components/Box.svelte'
  import Text from '../components/Text.svelte'
  

</script>

<Box 
  width="100%"
  height="100%"
  border="single"
  variant="primary"
  padding={1}
  flexDirection="column"
  alignItems="center"
  justifyContent="center"
>
  <Box
    
    border="double"
    variant="primary"
    alignItems="center"
    justifyContent="center"
    >
    <Text text="Hello World" variant="primary" />
  </Box>
  <Box
    
    border="rounded"
    variant="secondary"
    marginTop={1}
    justifyContent="center"
  >
    <Text text="Inside Box" variant="secondary" />
  </Box>
</Box>