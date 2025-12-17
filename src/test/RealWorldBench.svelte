<script lang="ts">
  import { Box, Text } from '../index.ts'

  // Simulates a monitoring dashboard - common TUI use case
  // Multiple widgets updating at different rates

  let phase = $state('running')
  let elapsed = $state(0)
  const DURATION = 10000 // 10 seconds of simulation

  // Dashboard data (like htop, monitoring tools)
  let cpu = $state({ usage: 45, cores: [23, 67, 45, 89, 12, 56, 34, 78] })
  let memory = $state({ used: 8.2, total: 16, percent: 51 })
  let network = $state({ rx: 1250, tx: 890, rxTotal: 0, txTotal: 0 })
  let processes = $state<{pid: number, name: string, cpu: number, mem: number}[]>([])
  let logs = $state<{time: string, level: string, msg: string}[]>([])
  let diskIO = $state({ read: 45, write: 23 })

  // Metrics
  let updateCount = $state(0)
  let renderTimes: number[] = []
  let lastRenderStart = 0

  // Different update intervals (realistic)
  let intervals: NodeJS.Timer[] = []

  $effect(() => {
    if (phase === 'running') {
      startSimulation()
    }
    return () => {
      intervals.forEach(clearInterval)
    }
  })

  function startSimulation() {
    const startTime = performance.now()

    // Initialize processes (like ps aux)
    processes = Array.from({ length: 20 }, (_, i) => ({
      pid: 1000 + i,
      name: ['node', 'bun', 'code', 'chrome', 'slack', 'docker', 'nginx', 'postgres'][i % 8],
      cpu: Math.random() * 15,
      mem: Math.random() * 5
    }))

    // CPU updates every 100ms (10 fps) - like real monitoring
    intervals.push(setInterval(() => {
      lastRenderStart = performance.now()
      cpu.usage = 30 + Math.random() * 40
      cpu.cores = cpu.cores.map(() => Math.floor(Math.random() * 100))
      updateCount++
      trackRender()
    }, 100))

    // Memory updates every 500ms
    intervals.push(setInterval(() => {
      memory.used = 7 + Math.random() * 4
      memory.percent = (memory.used / memory.total) * 100
      updateCount++
    }, 500))

    // Network updates every 200ms
    intervals.push(setInterval(() => {
      network.rx = 800 + Math.random() * 1000
      network.tx = 500 + Math.random() * 800
      network.rxTotal += network.rx
      network.txTotal += network.tx
      updateCount++
    }, 200))

    // Process list updates every 1000ms
    intervals.push(setInterval(() => {
      processes = processes.map(p => ({
        ...p,
        cpu: Math.max(0, p.cpu + (Math.random() - 0.5) * 5),
        mem: Math.max(0, p.mem + (Math.random() - 0.5) * 1)
      })).sort((a, b) => b.cpu - a.cpu)
      updateCount++
    }, 1000))

    // Log entries every 300ms
    intervals.push(setInterval(() => {
      const levels = ['INFO', 'WARN', 'DEBUG', 'ERROR']
      const msgs = [
        'Request completed',
        'Connection established',
        'Cache hit',
        'Query executed',
        'File processed',
        'Event received'
      ]
      logs = [
        {
          time: new Date().toISOString().slice(11, 19),
          level: levels[Math.floor(Math.random() * levels.length)],
          msg: msgs[Math.floor(Math.random() * msgs.length)]
        },
        ...logs.slice(0, 9) // Keep last 10
      ]
      updateCount++
    }, 300))

    // Disk I/O every 250ms
    intervals.push(setInterval(() => {
      diskIO.read = 20 + Math.random() * 60
      diskIO.write = 10 + Math.random() * 40
      updateCount++
    }, 250))

    // Elapsed time every 100ms
    intervals.push(setInterval(() => {
      elapsed = Math.floor((performance.now() - startTime) / 1000)
      if (performance.now() - startTime > DURATION) {
        endSimulation()
      }
    }, 100))
  }

  function trackRender() {
    // Track time since last render started
    if (lastRenderStart > 0) {
      const renderTime = performance.now() - lastRenderStart
      renderTimes.push(renderTime)
    }
  }

  function endSimulation() {
    phase = 'done'
    intervals.forEach(clearInterval)
    intervals = []
    printResults()
  }

  function printResults() {
    const avgRender = renderTimes.length > 0
      ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
      : 0
    const sortedRenders = [...renderTimes].sort((a, b) => a - b)
    const p95 = sortedRenders[Math.floor(sortedRenders.length * 0.95)] || 0
    const mem = process.memoryUsage().heapUsed / 1024 / 1024

    console.log('\n' + '='.repeat(70))
    console.log('  REAL-WORLD BENCHMARK: Dashboard Simulation (10 seconds)')
    console.log('='.repeat(70))
    console.log('')
    console.log('  Scenario: System monitoring dashboard')
    console.log('    - CPU: updates 10x/sec (8 cores)')
    console.log('    - Memory: updates 2x/sec')
    console.log('    - Network: updates 5x/sec')
    console.log('    - Processes: 20 items, updates 1x/sec')
    console.log('    - Logs: streaming 3x/sec')
    console.log('    - Disk I/O: updates 4x/sec')
    console.log('')
    console.log('  Results:')
    console.log('  ' + '-'.repeat(50))
    console.log(`    Total updates:     ${updateCount}`)
    console.log(`    Updates/second:    ${(updateCount / 10).toFixed(1)}`)
    console.log(`    Avg render time:   ${avgRender.toFixed(2)}ms`)
    console.log(`    P95 render time:   ${p95.toFixed(2)}ms`)
    console.log(`    Memory:            ${mem.toFixed(2)}MB`)
    console.log('')
    console.log('='.repeat(70))
    console.log('  Press Ctrl+C to exit')
    console.log('='.repeat(70) + '\n')
  }

  function formatBytes(kb: number): string {
    if (kb > 1000) return (kb / 1000).toFixed(1) + ' MB'
    return kb.toFixed(0) + ' KB'
  }

  function cpuBar(percent: number): string {
    const filled = Math.floor(percent / 10)
    return '█'.repeat(filled) + '░'.repeat(10 - filled)
  }
</script>

<Box width="100%" height="100%" flexDirection="column" padding={1}>
  <!-- Header -->
  <Box border="single" borderColor={0x6366f1} padding={1} marginBottom={1}>
    <Text text={`Dashboard Benchmark - ${phase === 'running' ? elapsed + 's / 10s' : 'Complete!'}`} color={0x6366f1} bold />
  </Box>

  <Box flexDirection="row" gap={2}>
    <!-- Left column -->
    <Box flexDirection="column" width="50%">
      <!-- CPU -->
      <Box border="single" borderColor={0x22c55e} padding={1} marginBottom={1}>
        <Box flexDirection="column">
          <Text text={`CPU: ${cpu.usage.toFixed(1)}%`} color={0x22c55e} bold />
          {#each cpu.cores as core, i}
            <Box flexDirection="row">
              <Text text={`Core ${i}: `} color={0x64748b} />
              <Text text={cpuBar(core)} color={core > 80 ? 0xef4444 : core > 50 ? 0xf59e0b : 0x22c55e} />
              <Text text={` ${core}%`} color={0x94a3b8} />
            </Box>
          {/each}
        </Box>
      </Box>

      <!-- Memory & Disk -->
      <Box border="single" borderColor={0x3b82f6} padding={1} marginBottom={1}>
        <Box flexDirection="column">
          <Text text={`Memory: ${memory.used.toFixed(1)}GB / ${memory.total}GB (${memory.percent.toFixed(0)}%)`} color={0x3b82f6} bold />
          <Text text={`Disk R: ${diskIO.read.toFixed(0)} MB/s | W: ${diskIO.write.toFixed(0)} MB/s`} color={0x94a3b8} />
        </Box>
      </Box>

      <!-- Network -->
      <Box border="single" borderColor={0x8b5cf6} padding={1}>
        <Box flexDirection="column">
          <Text text="Network" color={0x8b5cf6} bold />
          <Text text={`↓ ${formatBytes(network.rx)}/s  ↑ ${formatBytes(network.tx)}/s`} color={0x94a3b8} />
          <Text text={`Total: ↓${formatBytes(network.rxTotal)} ↑${formatBytes(network.txTotal)}`} color={0x64748b} />
        </Box>
      </Box>
    </Box>

    <!-- Right column -->
    <Box flexDirection="column" width="50%">
      <!-- Processes -->
      <Box border="single" borderColor={0xf59e0b} padding={1} marginBottom={1} height={12}>
        <Box flexDirection="column">
          <Text text="Top Processes" color={0xf59e0b} bold />
          {#each processes.slice(0, 8) as proc}
            <Box flexDirection="row">
              <Text text={`${proc.pid} `} color={0x64748b} />
              <Text text={proc.name.padEnd(10)} color={0xe2e8f0} />
              <Text text={`${proc.cpu.toFixed(1)}%`} color={proc.cpu > 10 ? 0xef4444 : 0x22c55e} />
            </Box>
          {/each}
        </Box>
      </Box>

      <!-- Logs -->
      <Box border="single" borderColor={0x94a3b8} padding={1} height={8}>
        <Box flexDirection="column">
          <Text text="Logs" color={0x94a3b8} bold />
          {#each logs.slice(0, 5) as log}
            <Box flexDirection="row">
              <Text text={`${log.time} `} color={0x64748b} />
              <Text
                text={`[${log.level}]`}
                color={log.level === 'ERROR' ? 0xef4444 : log.level === 'WARN' ? 0xf59e0b : 0x22c55e}
              />
              <Text text={` ${log.msg}`} color={0x94a3b8} />
            </Box>
          {/each}
        </Box>
      </Box>
    </Box>
  </Box>

  {#if phase === 'done'}
    <Box marginTop={1}>
      <Text text="Benchmark complete! Check console for results." color={0x22c55e} bold />
    </Box>
  {/if}
</Box>
