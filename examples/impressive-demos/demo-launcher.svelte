<script>
  import { Box, Text, List, Button } from '../../src/components/ui'
  import { getCurrentTheme } from '../../src/theme/currentTheme.svelte'
  
  // Import our demos (compiled versions)
  import CounterDemo from './counter-demo.svelte.mjs'
  import DashboardDemo from './dashboard-demo.svelte.mjs'
  import ThemeShowcase from './theme-showcase.svelte.mjs'
  
  // Get reactive theme
  const theme = getCurrentTheme()
  
  // Demo configuration
  const demos = [
    {
      id: 'counter',
      name: 'Interactive Counter',
      description: 'Svelte 5 runes, reactive state, auto-increment, themed UI',
      icon: '🔢',
      component: CounterDemo,
      color: 'success'
    },
    {
      id: 'dashboard', 
      name: 'System Dashboard',
      description: 'Real-time updates, multiple components, complex layouts',
      icon: '🏠',
      component: DashboardDemo,
      color: 'info'
    },
    {
      id: 'themes',
      name: 'Theme Showcase', 
      description: 'Dynamic theming, color palettes, auto-switching',
      icon: '🎨',
      component: ThemeShowcase,
      color: 'warning'
    }
  ]
  
  // State
  let currentDemo = $state(null)
  let selectedIndex = $state(0)
  let showWelcome = $state(true)
  
  // Functions
  function selectDemo(demo) {
    currentDemo = demo
    showWelcome = false
  }
  
  function goBack() {
    currentDemo = null
    showWelcome = true
  }
  
  function nextDemo() {
    selectedIndex = (selectedIndex + 1) % demos.length
  }
  
  function prevDemo() {
    selectedIndex = selectedIndex === 0 ? demos.length - 1 : selectedIndex - 1
  }
  
  function launchSelected() {
    selectDemo(demos[selectedIndex])
  }
  
  function getColorForDemo(colorName) {
    const colors = theme().getColors()
    return colors[colorName] || colors.primary
  }
</script>

{#if currentDemo}
  <!-- Show selected demo with back button -->
  <Box width="100%" height="100%">
    <Box padding={1} borderBottom={true} borderColor={theme().getColors().secondary}>
      <Button 
        onClick={goBack}
        color={theme().getColors().info}
        border={true}
        width={15}
      >
        ← Back to Launcher
      </Button>
    </Box>
    
    <Box width="100%" height="90%">
      <svelte:component this={currentDemo.component} />
    </Box>
  </Box>
  
{:else if showWelcome}
  <!-- Welcome screen with demo selector -->
  <Box width="100%" height="100%" padding={2}>
    
    <!-- Header -->
    <Box border={true} padding={2} marginBottom={2} borderColor={theme().getColors().primary}>
      <Text bold fontSize="xl" color={theme().getColors().primary} align="center">
        🚀 SvelTUI Demo Launcher
      </Text>
      <Text color={theme().getColors().secondary} align="center">
        Svelte 5 Terminal UI Framework - Interactive Demonstrations
      </Text>
    </Box>
    
    <!-- Achievement Banner -->
    <Box 
      border={true} 
      padding={2} 
      marginBottom={2} 
      borderColor={theme().getColors().success}
      backgroundColor={theme().getColors().background}
    >
      <Text bold color={theme().getColors().success} align="center">
        🎉 BREAKTHROUGH ACHIEVED! 🎉
      </Text>
      <Text color={theme().getColors().foreground} align="center">
        Svelte 5 client-side mounting successfully working in Node.js terminal environment!
      </Text>
      <Text color={theme().getColors().secondary} align="center" fontSize="small">
        Featuring: Reactive State • Component System • Dynamic Theming • Virtual DOM
      </Text>
    </Box>
    
    <!-- Demo Selection -->
    <Box flexDirection="row" gap={4} height="60%">
      
      <!-- Left: Demo List -->
      <Box width="60%" border={true} padding={1} borderColor={theme().getColors().info}>
        <Text bold color={theme().getColors().info}>📋 Available Demonstrations</Text>
        
        <Box marginTop={1}>
          {#each demos as demo, index}
            <Box 
              flexDirection="row" 
              gap={2} 
              padding={1}
              marginBottom={1}
              border={true}
              borderColor={index === selectedIndex ? getColorForDemo(demo.color) : theme().getColors().secondary}
              backgroundColor={index === selectedIndex ? getColorForDemo(demo.color) : 'transparent'}
              style="cursor: pointer"
              onClick={() => selectedIndex = index}
            >
              <Text fontSize="large" color={index === selectedIndex ? theme().getColors().background : getColorForDemo(demo.color)}>
                {demo.icon}
              </Text>
              
              <Box flexDirection="column">
                <Text 
                  bold 
                  color={index === selectedIndex ? theme().getColors().background : theme().getColors().foreground}
                >
                  {demo.name}
                </Text>
                <Text 
                  fontSize="small"
                  color={index === selectedIndex ? theme().getColors().background : theme().getColors().secondary}
                >
                  {demo.description}
                </Text>
              </Box>
            </Box>
          {/each}
        </Box>
      </Box>
      
      <!-- Right: Demo Preview & Controls -->
      <Box width="40%" flexDirection="column" gap={2}>
        
        <!-- Selected Demo Info -->
        <Box border={true} padding={2} borderColor={getColorForDemo(demos[selectedIndex].color)}>
          <Text bold color={getColorForDemo(demos[selectedIndex].color)} fontSize="large">
            {demos[selectedIndex].icon} {demos[selectedIndex].name}
          </Text>
          
          <Text color={theme().getColors().foreground} marginTop={1}>
            {demos[selectedIndex].description}
          </Text>
          
          <Box marginTop={2}>
            <Text bold color={theme().getColors().info}>Features:</Text>
            <Text color={theme().getColors().foreground}>• Svelte 5 Runes ($state, $derived, $effect)</Text>
            <Text color={theme().getColors().foreground}>• Reactive Theme System</Text>
            <Text color={theme().getColors().foreground}>• Component Composition</Text>
            <Text color={theme().getColors().foreground}>• Terminal-optimized UI</Text>
          </Box>
        </Box>
        
        <!-- Controls -->
        <Box border={true} padding={1} borderColor={theme().getColors().warning}>
          <Text bold color={theme().getColors().warning}>🎮 Controls</Text>
          
          <Box flexDirection="row" gap={1} marginTop={1} marginBottom={2}>
            <Button 
              onClick={prevDemo}
              color={theme().getColors().secondary}
              border={true}
              width={8}
            >
              ↑ Prev
            </Button>
            
            <Button 
              onClick={nextDemo}
              color={theme().getColors().secondary}
              border={true}
              width={8}
            >
              ↓ Next
            </Button>
          </Box>
          
          <Button 
            onClick={launchSelected}
            color={getColorForDemo(demos[selectedIndex].color)}
            border={true}
            width="100%"
            bold={true}
          >
            🚀 Launch {demos[selectedIndex].name}
          </Button>
        </Box>
        
        <!-- Tech Stack -->
        <Box border={true} padding={1} borderColor={theme().getColors().error}>
          <Text bold color={theme().getColors().error}>⚡ Technology Stack</Text>
          
          <Box marginTop={1}>
            <Text color={theme().getColors().success}>✓ Svelte 5 (Client-side)</Text>
            <Text color={theme().getColors().success}>✓ Bun Runtime</Text>
            <Text color={theme().getColors().success}>✓ Terminal Virtual DOM</Text>
            <Text color={theme().getColors().success}>✓ Blessed Library</Text>
            <Text color={theme().getColors().success}>✓ Reactive Theming</Text>
            <Text color={theme().getColors().success}>✓ TypeScript</Text>
          </Box>
        </Box>
      </Box>
    </Box>
    
    <!-- Footer -->
    <Box 
      border={true} 
      padding={1} 
      marginTop={2}
      borderColor={theme().getColors().primary}
      flexDirection="row"
      justifyContent="space-between"
    >
      <Text color={theme().getColors().info}>
        🔧 Demo: {selectedIndex + 1}/{demos.length}
      </Text>
      
      <Text color={theme().getColors().success}>
        ✨ All demos use live Svelte 5 reactivity!
      </Text>
      
      <Text color={theme().getColors().warning}>
        🎨 Theme: {theme().getThemeInfo().name}
      </Text>
    </Box>
  </Box>
{/if}