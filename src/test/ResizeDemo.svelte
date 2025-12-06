<script>
  import Box from '../components/Box.svelte'
  import Text from '../components/Text.svelte'
  import { terminalSize } from '../core/state/engine.svelte.ts'

  let resizeCount = $state(0)
  let lastResize = $state(new Date().toLocaleTimeString())

  
</script>

<Box
  width={'100%'}
  height={'100%'}
  border="double"
  borderColor="cyan"
  padding={2}
  flexDirection="column"
  gap={1}
>
  <Text text="📐 Resize Test Demo" color="yellow" bold={true} />

  <Box border="single" borderColor="blue" padding={1} marginY={1}>
    <Text text={`Terminal: ${terminalSize.width}x${terminalSize.height} | Mode: ${terminalSize.fullscreen ? 'Fullscreen' : 'Non-fullscreen'}`} color="cyan" />
  </Box>

  <Text text={`Resize count: ${resizeCount}`} color="green" />
  <Text text={`Last resize: ${lastResize}`} color="gray" />

  <Box flexDirection="row" gap={2} marginY={1}>
    <Box
      border="rounded"
      borderColor="magenta"
      padding={1}
      flexGrow={1}
    >
      <Text text="Flex Box 1" color="magenta" />
      <Text text={`Width: ${terminalSize.width / 2 - 6}ch`} color="gray" dim={true} />
    </Box>

    <Box
      border="rounded"
      borderColor="green"
      padding={1}
      flexGrow={1}
    >
      <Text text="Flex Box 2" color="green" />
      <Text text={`Width: ${terminalSize.width / 2 - 6}ch`} color="gray" dim={true} />
    </Box>
  </Box>

  <Box
    height={10}
    border="dashed"
    borderColor="yellow"
    padding={1}
    scrollable={true}
  >
    <Text text="Scrollable content area" color="yellow" />
    {#each Array(20) as _, i}
      <Text text={`Line ${i + 1}: This is a long line to test how resize affects scrollable content in the box`} color="white" />
    {/each}
  </Box>

  <Text text="Try resizing your terminal to see how the layout adapts!" color="cyan" dim={true} />
  <Text text="Press Ctrl+C to exit" color="gray" dim={true} />
</Box>