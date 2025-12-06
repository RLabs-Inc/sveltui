<script lang="ts">
  import { Box, Text } from '../../src/index.ts'
  import { keyboard } from '../../src/input/keyboard.svelte.ts'
  import { onMount } from 'svelte'

  let count = $state(0)

  onMount(() => {
    // Listen for + and - keys
    const cleanup = keyboard.onKey(['+', '=', '-', '_'], () => {})

    const unsubscribe = keyboard.on((event) => {
      if (event.key === '+' || event.key === '=') {
        count++
        return true
      }
      if (event.key === '-' || event.key === '_') {
        count--
        return true
      }
    })

    return () => {
      cleanup()
      unsubscribe()
    }
  })
</script>

<Box
  width="100%"
  height="100%"
  flexDirection="column"
  justifyContent="center"
  alignItems="center"
  gap={2}
>
  <Box
    padding={1}
    borderStyle="round"
    borderColor="cyan"
  >
    <Text color="cyan" bold>SvelTUI Counter Demo</Text>
  </Box>

  <Box
    padding={2}
    borderStyle="double"
    borderColor="green"
    minWidth={30}
    justifyContent="center"
  >
    <Text color="green" fontSize={2}>Count: {count}</Text>
  </Box>

  <Box flexDirection="column" alignItems="center" gap={1}>
    <Text color="yellow">Press + to increment</Text>
    <Text color="yellow">Press - to decrement</Text>
    <Text color="gray" italic>Ctrl+C to exit</Text>
  </Box>
</Box>
