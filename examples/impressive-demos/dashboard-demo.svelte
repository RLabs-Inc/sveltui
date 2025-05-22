<script>
  import { Box, Text, List, Input, Checkbox } from '../../src/components/ui'
  import { getCurrentTheme } from '../../src/theme/currentTheme.svelte'
  
  // Get reactive theme
  const theme = getCurrentTheme()
  
  // Reactive state
  let systemName = $state('SvelTUI Terminal System')
  let cpuUsage = $state(45)
  let memoryUsage = $state(67)
  let diskUsage = $state(23)
  let networkActivity = $state(true)
  let notifications = $state(true)
  let darkMode = $state(true)
  
  // System stats that update
  let uptime = $state(0)
  let activeProcesses = $state(42)
  let networkSpeed = $state(125.6)
  
  // Logs and activities
  let logEntries = $state([
    'System startup completed ✅',
    'Network interface initialized 🌐', 
    'Memory check passed ✅',
    'SvelTUI renderer loaded 🚀',
    'Theme system activated 🎨'
  ])
  
  let todoItems = $state([
    { id: 1, text: 'Implement authentication', done: false },
    { id: 2, text: 'Add file browser', done: true },
    { id: 3, text: 'Create settings panel', done: false },
    { id: 4, text: 'Write documentation', done: false }
  ])
  
  // Simulated real-time updates
  $effect(() => {
    const interval = setInterval(() => {
      uptime += 1
      cpuUsage = Math.max(20, Math.min(90, cpuUsage + (Math.random() - 0.5) * 10))
      memoryUsage = Math.max(30, Math.min(95, memoryUsage + (Math.random() - 0.5) * 5))
      networkSpeed = Math.max(50, Math.min(200, networkSpeed + (Math.random() - 0.5) * 20))
    }, 2000)
    
    return () => clearInterval(interval)
  })
  
  // Functions
  function addLogEntry() {
    const newEntries = [
      'User action detected 👤',
      'Data synchronization complete 🔄',
      'Cache updated successfully ⚡',
      'Background task finished ✨',
      'Performance optimization applied 🚀'
    ]
    const randomEntry = newEntries[Math.floor(Math.random() * newEntries.length)]
    logEntries = [randomEntry, ...logEntries.slice(0, 4)]
  }
  
  function toggleTodo(id) {
    todoItems = todoItems.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    )
  }
  
  function getProgressBar(value, max = 100, width = 20) {
    const filled = Math.round((value / max) * width)
    const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
    return `${bar} ${value}%`
  }
  
  function getStatusColor(value) {
    if (value < 30) return theme().currentTheme.colors.success
    if (value < 70) return theme().currentTheme.colors.warning
    return theme().currentTheme.colors.error
  }
</script>

<Box width="100%" height="100%" padding={1}>
  <!-- Header -->
  <Box border={true} padding={1} marginBottom={1} borderColor={theme().currentTheme.colors.primary}>
    <Text bold fontSize="large" color={theme().currentTheme.colors.primary}>
      🏠 {systemName} Dashboard
    </Text>
    <Text color={theme().currentTheme.colors.secondary}>
      Powered by Svelte 5 + SvelTUI | Uptime: {Math.floor(uptime/60)}m {uptime%60}s
    </Text>
  </Box>
  
  <!-- Main Content - Two Columns -->
  <Box flexDirection="row" gap={2} height="80%">
    
    <!-- Left Column -->
    <Box width="50%" flexDirection="column" gap={1}>
      
      <!-- System Stats -->
      <Box border={true} padding={1} borderColor={theme().currentTheme.colors.info}>
        <Text bold color={theme().currentTheme.colors.info}>📊 System Resources</Text>
        
        <Box marginTop={1}>
          <Text>CPU Usage</Text>
          <Text color={getStatusColor(cpuUsage)}>
            {getProgressBar(cpuUsage)}
          </Text>
        </Box>
        
        <Box marginTop={1}>
          <Text>Memory Usage</Text>
          <Text color={getStatusColor(memoryUsage)}>
            {getProgressBar(memoryUsage)}
          </Text>
        </Box>
        
        <Box marginTop={1}>
          <Text>Disk Usage</Text>
          <Text color={getStatusColor(diskUsage)}>
            {getProgressBar(diskUsage)}
          </Text>
        </Box>
        
        <Box marginTop={1} flexDirection="row" gap={4}>
          <Text>Processes: <span style="color: {theme().currentTheme.colors.success}">{activeProcesses}</span></Text>
          <Text>Network: <span style="color: {theme().currentTheme.colors.info}">{networkSpeed.toFixed(1)} MB/s</span></Text>
        </Box>
      </Box>
      
      <!-- Quick Actions -->
      <Box border={true} padding={1} borderColor={theme().currentTheme.colors.success}>
        <Text bold color={theme().currentTheme.colors.success}>⚙️ Quick Actions</Text>
        
        <Box marginTop={1} flexDirection="column" gap={1}>
          <Checkbox bind:checked={networkActivity}>
            Network Activity Monitor
          </Checkbox>
          
          <Checkbox bind:checked={notifications}>
            System Notifications
          </Checkbox>
          
          <Checkbox bind:checked={darkMode}>
            Dark Mode Interface
          </Checkbox>
        </Box>
        
        <Box marginTop={1}>
          <Text>System Name:</Text>
          <Input bind:value={systemName} width="100%" />
        </Box>
      </Box>
      
    </Box>
    
    <!-- Right Column -->
    <Box width="50%" flexDirection="column" gap={1}>
      
      <!-- Activity Log -->
      <Box border={true} padding={1} borderColor={theme().currentTheme.colors.warning} height="50%">
        <Text bold color={theme().currentTheme.colors.warning}>📝 Activity Log</Text>
        <Box marginTop={1} onClick={addLogEntry} style="cursor: pointer">
          <Text color={theme().currentTheme.colors.secondary}>
            Click here to simulate activity →
          </Text>
        </Box>
        
        <List
          items={logEntries}
          height={8}
          scrollable={true}
          style={{
            border: { color: theme().currentTheme.colors.secondary }
          }}
        />
      </Box>
      
      <!-- Todo List -->
      <Box border={true} padding={1} borderColor={theme().currentTheme.colors.error} height="50%">
        <Text bold color={theme().currentTheme.colors.error}>✅ Task List</Text>
        
        <Box marginTop={1}>
          {#each todoItems as item (item.id)}
            <Box flexDirection="row" gap={1} marginBottom={0.5}>
              <Checkbox 
                checked={item.done}
                onChange={() => toggleTodo(item.id)}
              />
              <Text 
                color={item.done ? theme().currentTheme.colors.success : theme().currentTheme.colors.foreground}
                style={item.done ? 'text-decoration: line-through' : ''}
              >
                {item.text}
              </Text>
            </Box>
          {/each}
        </Box>
        
        <Box marginTop={1}>
          <Text fontSize="small" color={theme().currentTheme.colors.secondary}>
            Completed: {todoItems.filter(item => item.done).length}/{todoItems.length}
          </Text>
        </Box>
      </Box>
      
    </Box>
  </Box>
  
  <!-- Footer Status Bar -->
  <Box 
    border={true} 
    padding={1} 
    marginTop={1}
    borderColor={theme().currentTheme.colors.secondary}
    flexDirection="row"
    justifyContent="space-between"
  >
    <Text color={theme().currentTheme.colors.success}>
      🟢 System Status: Online
    </Text>
    
    <Text color={theme().currentTheme.colors.info}>
      Theme: {theme().currentTheme.info.name}
    </Text>
    
    <Text color={theme().currentTheme.colors.warning}>
      🔄 Live Updates: {networkActivity ? 'ON' : 'OFF'}
    </Text>
  </Box>
</Box>