<script>
  import { Box, Text, Input, Button } from '../../src/components/ui'
  import { getCurrentTheme } from '../../src/theme/currentTheme.svelte'
  
  // Get reactive theme
  const theme = getCurrentTheme()
  
  // Reactive state with Svelte 5 runes
  let count = $state(0)
  let stepSize = $state(1)
  let autoIncrement = $state(false)
  let autoInterval = $state(null)
  let message = $state('Welcome to SvelTUI! 🚀')
  
  // Reactive derived values
  let countColor = $derived(
    count > 10 ? theme().currentTheme.colors.success :
    count < 0 ? theme().currentTheme.colors.error : 
    theme().currentTheme.colors.primary
  )
  
  let countDisplay = $derived(`${count}`)
  let progressBar = $derived('█'.repeat(Math.max(0, Math.min(20, count))))
  
  // Auto increment effect
  $effect(() => {
    if (autoIncrement) {
      autoInterval = setInterval(() => {
        count += stepSize
        if (count >= 50) {
          autoIncrement = false
          message = '🎉 Auto-increment completed!'
        }
      }, 100)
    } else if (autoInterval) {
      clearInterval(autoInterval)
      autoInterval = null
    }
    
    return () => {
      if (autoInterval) clearInterval(autoInterval)
    }
  })
  
  // Functions
  function increment() {
    count += stepSize
    message = count % 10 === 0 ? `Milestone: ${count}! 🎊` : `Count: ${count}`
  }
  
  function decrement() {
    count -= stepSize  
    message = count === 0 ? 'Back to zero! 🏁' : `Count: ${count}`
  }
  
  function reset() {
    count = 0
    autoIncrement = false
    message = 'Counter reset! ✨'
  }
  
  function toggleAuto() {
    autoIncrement = !autoIncrement
    message = autoIncrement ? 'Auto-increment started! 🚀' : 'Auto-increment stopped'
  }
</script>

<Box border={true} width="100%" height="100%" padding={2}>
  <Text bold fontSize="large" color={theme().currentTheme.colors.primary}>
    🚀 SvelTUI Counter Demo - Svelte 5 in Terminal! 
  </Text>
  
  <Box marginTop={1} marginBottom={1}>
    <Text color={theme().currentTheme.colors.secondary}>
      {message}
    </Text>
  </Box>
  
  <!-- Main Counter Display -->
  <Box border={true} padding={1} marginBottom={2} borderColor={countColor}>
    <Text align="center" bold fontSize="xl" color={countColor}>
      Count: {countDisplay}
    </Text>
    <Box marginTop={1}>
      <Text color={theme().currentTheme.colors.success}>
        Progress: {progressBar}
      </Text>
    </Box>
  </Box>
  
  <!-- Controls Row 1 -->
  <Box flexDirection="row" gap={2} marginBottom={1}>
    <Button 
      onClick={decrement}
      color={theme().getColors().error}
      border={true}
      width={12}
    >
      ➖ (-{stepSize})
    </Button>
    
    <Button 
      onClick={increment}
      color={theme().currentTheme.colors.success} 
      border={true}
      width={12}
    >
      ➕ (+{stepSize})
    </Button>
    
    <Button 
      onClick={reset}
      color={theme().currentTheme.colors.warning}
      border={true} 
      width={10}
    >
      🔄 Reset
    </Button>
  </Box>
  
  <!-- Controls Row 2 -->
  <Box flexDirection="row" gap={2} marginBottom={2}>
    <Box>
      <Text>Step Size:</Text>
      <Input 
        bind:value={stepSize}
        width={8}
        type="number"
        min={1}
        max={10}
      />
    </Box>
    
    <Button 
      onClick={toggleAuto}
      color={autoIncrement ? theme().currentTheme.colors.error : theme().currentTheme.colors.info}
      border={true}
      width={16}
    >
      {autoIncrement ? '⏹️ Stop Auto' : '▶️ Start Auto'}
    </Button>
  </Box>
  
  <!-- Stats Section -->
  <Box border={true} padding={1} borderColor={theme().currentTheme.colors.info}>
    <Text bold color={theme().currentTheme.colors.info}>📊 Statistics:</Text>
    <Text>• Current Value: {count}</Text>
    <Text>• Step Size: {stepSize}</Text>
    <Text>• Auto Mode: {autoIncrement ? '🟢 ON' : '🔴 OFF'}</Text>
    <Text>• Progress: {Math.round((count / 50) * 100)}% to 50</Text>
  </Box>
  
  <!-- Theme Info -->
  <Box marginTop={1}>
    <Text fontSize="small" color={theme().currentTheme.colors.secondary}>
      Theme: {theme().currentTheme.info.name} | Powered by Svelte 5 + SvelTUI ✨
    </Text>
  </Box>
</Box>