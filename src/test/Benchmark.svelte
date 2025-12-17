<script lang="ts">
  import { Box, Text } from '../index.ts'

  const COUNTER_ITERATIONS = 100
  const LIST_SIZES = [10, 50, 100, 250, 500]
  const UPDATES_PER_SIZE = 20

  let phase = $state('starting')
  let currentTest = $state('')
  let count = $state(0)
  let items: {id: number, value: number}[] = $state([])

  // Results storage
  let counterResults: number[] = $state([])
  let listResults: {size: number, renderMs: number, updateMs: number}[] = $state([])

  // Run benchmark on mount
  $effect(() => {
    if (phase === 'starting') {
      setTimeout(runFullBenchmark, 100)
    }
  })

  async function runFullBenchmark() {
    console.log('\n' + '='.repeat(60))
    console.log('  SvelTUI Performance Benchmark')
    console.log('='.repeat(60))

    // Test 1: Counter updates
    await runCounterTest()

    // Test 2: List scaling
    await runListScalingTest()

    // Print final results
    printResults()
  }

  async function runCounterTest() {
    phase = 'counter'
    currentTest = 'Counter Update Latency'
    console.log('\n[1] Counter Update Latency Test')
    console.log(`    ${COUNTER_ITERATIONS} iterations...`)

    count = 0
    counterResults = []

    // Warmup
    for (let i = 0; i < 10; i++) {
      count++
      await tick()
    }

    // Actual test
    for (let i = 0; i < COUNTER_ITERATIONS; i++) {
      const start = performance.now()
      count++
      await tick()
      counterResults.push(performance.now() - start)
    }

    const avg = counterResults.reduce((a, b) => a + b, 0) / counterResults.length
    console.log(`    Avg update: ${avg.toFixed(3)}ms`)
  }

  async function runListScalingTest() {
    phase = 'list'
    currentTest = 'List Scaling Test'
    console.log('\n[2] List Scaling Test')

    listResults = []

    for (const size of LIST_SIZES) {
      currentTest = `List: ${size} items`
      console.log(`    Testing ${size} elements...`)

      // Create list
      const renderStart = performance.now()
      items = Array.from({ length: size }, (_, i) => ({ id: i, value: 0 }))
      await tick()
      const renderMs = performance.now() - renderStart

      // Update items
      const updateTimes: number[] = []
      for (let i = 0; i < UPDATES_PER_SIZE; i++) {
        const idx = i % size
        const start = performance.now()
        items[idx].value++
        await tick()
        updateTimes.push(performance.now() - start)
      }

      const avgUpdate = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length
      listResults.push({ size, renderMs, updateMs: avgUpdate })

      console.log(`      Render: ${renderMs.toFixed(2)}ms, Avg update: ${avgUpdate.toFixed(3)}ms`)
    }

    // Clear list
    items = []
  }

  function tick() {
    return new Promise(r => setTimeout(r, 1))
  }

  function printResults() {
    phase = 'done'
    currentTest = 'Complete!'

    const sorted = [...counterResults].sort((a, b) => a - b)
    const avg = counterResults.reduce((a, b) => a + b, 0) / counterResults.length
    const p50 = sorted[Math.floor(sorted.length * 0.5)]
    const p95 = sorted[Math.floor(sorted.length * 0.95)]
    const p99 = sorted[Math.floor(sorted.length * 0.99)]

    console.log('\n' + '='.repeat(60))
    console.log('  RESULTS SUMMARY')
    console.log('='.repeat(60))

    console.log('\n  Counter Update Latency:')
    console.log(`    Avg: ${avg.toFixed(3)}ms | P50: ${p50.toFixed(3)}ms | P95: ${p95.toFixed(3)}ms | P99: ${p99.toFixed(3)}ms`)

    console.log('\n  List Scaling:')
    console.log('    Size     | Render    | Avg Update')
    console.log('    ' + '-'.repeat(40))
    for (const r of listResults) {
      console.log(`    ${r.size.toString().padStart(6)}   | ${r.renderMs.toFixed(2).padStart(7)}ms | ${r.updateMs.toFixed(3)}ms`)
    }

    console.log(`\n  Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`)
    console.log('='.repeat(60))
    console.log('  Press Ctrl+C to exit')
    console.log('='.repeat(60) + '\n')
  }
</script>

<Box width="100%" height="100%" flexDirection="column">
  <Box border="single" borderColor={0x6366f1} padding={1} marginBottom={1}>
    <Text text="SvelTUI Benchmark" color={0x6366f1} bold />
  </Box>

  <Box marginBottom={1}>
    <Text text={`Test: ${currentTest}`} color={0x94a3b8} />
  </Box>

  {#if phase === 'counter'}
    <Box>
      <Text text={`Count: ${count}`} color={0x22c55e} bold />
    </Box>
  {/if}

  {#if phase === 'list' && items.length > 0}
    <Box flexDirection="column" overflow="hidden" height={10}>
      {#each items.slice(0, 10) as item (item.id)}
        <Box flexDirection="row">
          <Text text={`Item ${item.id}: `} color={0x94a3b8} />
          <Text text={`${item.value}`} color={0x22c55e} />
        </Box>
      {/each}
      {#if items.length > 10}
        <Text text={`... and ${items.length - 10} more`} color={0x64748b} />
      {/if}
    </Box>
  {/if}

  {#if phase === 'done'}
    <Box marginY={1}>
      <Text text="Done! Check console for results" color={0xf59e0b} />
    </Box>
  {/if}
</Box>
