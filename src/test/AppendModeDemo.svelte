<script lang="ts">
  import { Box, Text } from '../index.ts'

  // Growing list of messages - simulates a chat or log output
  let messages = $state<string[]>(['Line 1: Hello from append mode!'])

  // Add a new message every 500ms
  let count = 1
  const interval = setInterval(() => {
    count++
    messages.push(`Line ${count}: Added at ${new Date().toLocaleTimeString()}`)

    // Stop after 15 messages
    if (count >= 15) {
      clearInterval(interval)
      messages.push('--- Done! Press Ctrl+C to exit. Try scrolling up! ---')
    }
  }, 500)
</script>

<Box flexDirection="column" width="100%">
  {#each messages as msg, i (i)}
    <Text text={msg} color={i % 2 === 0 ? 0x00ff00 : 0x00ffff} />
  {/each}
</Box>
