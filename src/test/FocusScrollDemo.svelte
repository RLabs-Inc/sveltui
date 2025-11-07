<script>
  import Box from '../components/Box.svelte'
  import Text from '../components/Text.svelte'
  
  let focused1 = $state(false)
  let focused2 = $state(false)
  let focused3 = $state(false)
  let focusLog = $state([])
  
  function addLog(msg) {
    focusLog = [...focusLog, `${new Date().toLocaleTimeString()}: ${msg}`].slice(-5)
  }
</script>

<Box 
  width="100%"
  height="100%"
  flexDirection="row"
  gap={2}
  padding={1}
>
  <!-- Left panel: Focusable boxes -->
  <Box
    width={40}
    flexDirection="column"
    gap={1}
  >
    <Text text="Tab/Shift+Tab to navigate" variant="warning" bold={true} />
    
    <Box
      border="single"
      variant={focused1 ? "primary" : "secondary"}
      padding={1}
      focusable={true}
      tabIndex={1}
      bind:focused={focused1}
      onfocus={() => addLog("Box 1 focused")}
      onblur={() => addLog("Box 1 blurred")}
    >
      <Text text={focused1 ? "Box 1 - FOCUSED" : "Box 1"} variant={focused1 ? "primary" : "secondary"} />
    </Box>
    
    <Box
      border="single"
      variant={focused2 ? "primary" : "secondary"}
      padding={1}
      focusable={true}
      tabIndex={2}
      bind:focused={focused2}
      onfocus={() => addLog("Box 2 focused")}
      onblur={() => addLog("Box 2 blurred")}
    >
      <Text text={focused2 ? "Box 2 - FOCUSED" : "Box 2"} variant={focused2 ? "primary" : "secondary"} />
    </Box>
    
    <!-- Scrollable box -->
    <Box
      border="double"
      variant={focused3 ? "primary" : "secondary"}
      padding={1}
      height={8}
      focusable={true}
      tabIndex={3}
      bind:focused={focused3}
      onfocus={() => addLog("Scrollable box focused")}
      onblur={() => addLog("Scrollable box blurred")}
    >
      <Text text={focused3 ? "Scrollable - Use ↑↓ PgUp/PgDn" : "Scrollable content"} variant={focused3 ? "primary" : "secondary"} bold={true} />
      {#each Array(20) as _, i}
        <Text text={`Line ${i + 1}: This is scrollable content that should be clipped`} muted />
      {/each}
    </Box>
  </Box>
  
  <!-- Right panel: Focus log -->
  <Box
    border="single"
    variant="tertiary"
    padding={1}
    flexGrow={1}
  >
    <Box flexDirection="column">
      <Text text="Focus Event Log:" variant="tertiary" bold={true} />
      {#each focusLog as log}
        <Text text={log} muted />
      {/each}
    </Box>
  </Box>
  
  <Box position="absolute" bottom={0} left={0}>
    <Text text="Ctrl+C to exit" color="gray" dim={true} />
  </Box>
</Box>