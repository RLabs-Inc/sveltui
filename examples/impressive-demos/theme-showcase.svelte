<script>
  import { Box, Text, List, Button } from '../../src/components/ui'
  import { getCurrentTheme } from '../../src/theme/currentTheme.svelte'
  
  // Get reactive theme
  const theme = getCurrentTheme()
  
  // Available themes for cycling
  const availableThemes = [
    'cyberpunk', 'dark', 'light', 'ocean', 'forest', 'sunset', 'terminal'
  ]
  
  let currentThemeIndex = $state(0)
  let autoSwitch = $state(false)
  let switchInterval = $state(null)
  
  // Demo components state
  let sampleText = $state('SvelTUI Theme Showcase! 🎨')
  let progressValue = $state(75)
  let isEnabled = $state(true)
  
  // Color preview data
  let colorPreview = $derived(() => {
    return [
      { name: 'Primary', color: theme().currentTheme.colors.primary, icon: '🔵' },
      { name: 'Secondary', color: theme().currentTheme.colors.secondary, icon: '🟡' },
      { name: 'Success', color: theme().currentTheme.colors.success, icon: '🟢' },
      { name: 'Warning', color: theme().currentTheme.colors.warning, icon: '🟠' },
      { name: 'Error', color: theme().currentTheme.colors.error, icon: '🔴' },
      { name: 'Info', color: theme().currentTheme.colors.info, icon: '🔷' }
    ]
  })
  
  // Auto-switch effect
  $effect(() => {
    if (autoSwitch) {
      switchInterval = setInterval(() => {
        nextTheme()
      }, 3000)
    } else if (switchInterval) {
      clearInterval(switchInterval)
      switchInterval = null
    }
    
    return () => {
      if (switchInterval) clearInterval(switchInterval)
    }
  })
  
  // Theme switching functions
  function nextTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % availableThemes.length
    const themeName = availableThemes[currentThemeIndex]
    theme().setTheme(themeName)
  }
  
  function prevTheme() {
    currentThemeIndex = currentThemeIndex === 0 
      ? availableThemes.length - 1 
      : currentThemeIndex - 1
    const themeName = availableThemes[currentThemeIndex]
    theme().setTheme(themeName)
  }
  
  function toggleAutoSwitch() {
    autoSwitch = !autoSwitch
  }
  
  function getProgressBar(value, char = '█') {
    const width = 30
    const filled = Math.round((value / 100) * width)
    return char.repeat(filled) + '░'.repeat(width - filled)
  }
</script>

<Box width="100%" height="100%" padding={2}>
  <!-- Header -->
  <Box border={true} padding={2} marginBottom={2} borderColor={theme().currentTheme.colors.primary}>
    <Text bold fontSize="xl" color={theme().currentTheme.colors.primary} align="center">
      🎨 SvelTUI Theme Showcase
    </Text>
    <Text color={theme().getColors().secondary} align="center">
      Dynamic theming with Svelte 5 reactivity
    </Text>
  </Box>
  
  <!-- Current Theme Info -->
  <Box 
    border={true} 
    padding={1} 
    marginBottom={2} 
    borderColor={theme().currentTheme.colors.secondary}
    backgroundColor={theme().currentTheme.colors.background}
  >
    <Text bold color={theme().currentTheme.colors.info}>
      🎯 Current Theme: {theme().currentTheme.info.name}
    </Text>
    <Text color={theme().currentTheme.colors.foreground}>
      {theme().currentTheme.info.description}
    </Text>
    <Text fontSize="small" color={theme().currentTheme.colors.secondary}>
      By {theme().currentTheme.info.author} • v{theme().currentTheme.info.version}
    </Text>
  </Box>
  
  <!-- Theme Controls -->
  <Box flexDirection="row" gap={2} marginBottom={2} justifyContent="center">
    <Button 
      onClick={prevTheme}
      color={theme().currentTheme.colors.info}
      border={true}
      width={12}
    >
      ← Previous
    </Button>
    
    <Button 
      onClick={toggleAutoSwitch}
      color={autoSwitch ? theme().currentTheme.colors.error : theme().currentTheme.colors.success}
      border={true}
      width={16}
    >
      {autoSwitch ? '⏹️ Stop Auto' : '▶️ Auto Switch'}
    </Button>
    
    <Button 
      onClick={nextTheme}
      color={theme().currentTheme.colors.info}
      border={true}
      width={12}
    >
      Next →
    </Button>
  </Box>
  
  <!-- Main Content - Three Columns -->
  <Box flexDirection="row" gap={2} height="60%">
    
    <!-- Left: Color Palette -->
    <Box width="30%" border={true} padding={1} borderColor={theme().currentTheme.colors.warning}>
      <Text bold color={theme().currentTheme.colors.warning}>🎨 Color Palette</Text>
      
      <Box marginTop={1}>
        {#each colorPreview as colorInfo}
          <Box flexDirection="row" gap={1} marginBottom={0.5}>
            <Text color={colorInfo.color}>{colorInfo.icon}</Text>
            <Text color={theme().currentTheme.colors.foreground}>
              {colorInfo.name}
            </Text>
            <Text fontSize="small" color={theme().currentTheme.colors.secondary}>
              {colorInfo.color}
            </Text>
          </Box>
        {/each}
      </Box>
      
      <Box marginTop={2} border={true} padding={1} borderColor={theme().currentTheme.colors.primary}>
        <Text color={theme().currentTheme.colors.primary}>Sample Border</Text>
      </Box>
    </Box>
    
    <!-- Center: Component Showcase -->
    <Box width="40%" border={true} padding={1} borderColor={theme().currentTheme.colors.success}>
      <Text bold color={theme().currentTheme.colors.success}>🧩 Component Preview</Text>

      <!-- Text Samples -->
      <Box marginTop={1} marginBottom={2}>
        <Text bold color={theme().currentTheme.colors.primary}>Primary Text</Text>
        <Text color={theme().currentTheme.colors.secondary}>Secondary Text</Text>
        <Text color={theme().currentTheme.colors.success}>Success Message ✅</Text>
        <Text color={theme().currentTheme.colors.warning}>Warning Alert ⚠️</Text>
        <Text color={theme().currentTheme.colors.error}>Error Message ❌</Text>
      </Box>
      
      <!-- Progress Bars -->
      <Box marginBottom={2}>
        <Text color={theme().currentTheme.colors.info}>Progress Indicators:</Text>
        <Text color={theme().currentTheme.colors.success}>
          {getProgressBar(progressValue)} {progressValue}%
        </Text>
        <Text color={theme().currentTheme.colors.warning}>
          {getProgressBar(45, '▓')} 45%
        </Text>
        <Text color={theme().currentTheme.colors.error}>
          {getProgressBar(25, '▄')} 25%
        </Text>
      </Box>
      
      <!-- Interactive Elements -->
      <Box border={true} padding={1} borderColor={theme().currentTheme.colors.info}>
        <Text color={theme().currentTheme.colors.info}>Interactive Elements:</Text>
        <Text color={isEnabled ? theme().currentTheme.colors.success : theme().currentTheme.colors.secondary}>
          ● Status: {isEnabled ? 'Enabled' : 'Disabled'}
        </Text>
      </Box>
    </Box>
    
    <!-- Right: Theme List -->
    <Box width="30%" border={true} padding={1} borderColor={theme().currentTheme.colors.error}>
      <Text bold color={theme().currentTheme.colors.error}>📋 Available Themes</Text>
      
      <Box marginTop={1}>
        {#each availableThemes as themeName, index}
          <Box 
            flexDirection="row" 
            gap={1} 
            marginBottom={0.5}
            padding={0.5}
            backgroundColor={index === currentThemeIndex ? theme().getColors().primary : 'transparent'}
          >
            <Text color={index === currentThemeIndex ? theme().currentTheme.colors.background : theme().currentTheme.colors.foreground}>
              {index === currentThemeIndex ? '▶️' : '  '}
            </Text>
            <Text 
              color={index === currentThemeIndex ? theme().currentTheme.colors.background : theme().currentTheme.colors.foreground}
              bold={index === currentThemeIndex}
            >
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </Text>
          </Box>
        {/each}
      </Box>
    </Box>
  </Box>
  
  <!-- Footer Stats -->
  <Box 
    border={true} 
    padding={1} 
    marginTop={2}
    borderColor={theme().currentTheme.colors.secondary}
    flexDirection="row"
    justifyContent="space-between"
  >
    <Text color={theme().currentTheme.colors.info}>
      🔄 Theme: {currentThemeIndex + 1}/{availableThemes.length}
    </Text>
    
    <Text color={theme().currentTheme.colors.success}>
      ✨ Svelte 5 Reactivity Working!
    </Text>
    
    <Text color={theme().currentTheme.colors.warning}>
      🚀 Powered by SvelTUI
    </Text>
  </Box>
  
  <!-- Live Demo Indicator -->
  {#if autoSwitch}
    <Box marginTop={1} align="center">
      <Text color={theme().currentTheme.colors.primary} bold>
        🔄 Live Theme Switching Active - Themes change every 3 seconds!
      </Text>
    </Box>
  {/if}
</Box>