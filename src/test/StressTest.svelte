<script lang="ts">
  import { Box, Text } from '../index.ts'

  let phase = $state('starting')
  let currentTest = $state('')
  let progress = $state('')

  // Test data
  let items: {id: number, value: number}[] = $state([])
  let rapidCount = $state(0)

  // Results
  let results: {test: string, metric: string, value: string}[] = $state([])

  $effect(() => {
    if (phase === 'starting') {
      setTimeout(runAllTests, 200)
    }
  })

  async function runAllTests() {
    console.log('\n' + '='.repeat(70))
    console.log('  SvelTUI STRESS TEST')
    console.log('='.repeat(70))

    // Test 1: Rapid fire updates
    await testRapidFire()

    // Test 2: Bulk add components
    await testBulkAdd()

    // Test 3: Bulk remove components
    await testBulkRemove()

    // Test 4: Concurrent updates (update many items at once)
    await testConcurrentUpdates()

    // Test 5: Add/Remove churn
    await testChurn()

    // Test 6: Deep list (1000 items)
    await testDeepList()

    // Test 7: Idle CPU measurement
    await testIdleCPU()

    // Test 8: MASSIVE list - 5000 items
    await testMassive()

    // Done
    phase = 'done'
    currentTest = 'All tests complete!'
    printResults()
  }

  // TEST 1: Rapid fire - how many updates per second?
  async function testRapidFire() {
    phase = 'rapid'
    currentTest = 'Rapid Fire Updates'
    console.log('\n[1] Rapid Fire Updates (3 seconds)')

    rapidCount = 0
    const duration = 3000
    const start = performance.now()

    while (performance.now() - start < duration) {
      rapidCount++
      await microtick()
    }

    const elapsed = performance.now() - start
    const updatesPerSec = Math.round((rapidCount / elapsed) * 1000)

    console.log(`    ${rapidCount} updates in ${elapsed.toFixed(0)}ms`)
    console.log(`    ${updatesPerSec} updates/second`)

    results.push({
      test: 'Rapid Fire',
      metric: 'Updates/sec',
      value: updatesPerSec.toString()
    })
  }

  // TEST 2: Bulk add - add 500 items at once
  async function testBulkAdd() {
    phase = 'bulk-add'
    currentTest = 'Bulk Add Components'
    console.log('\n[2] Bulk Add (500 items at once)')

    items = []
    await tick()

    const start = performance.now()
    items = Array.from({ length: 500 }, (_, i) => ({ id: i, value: 0 }))
    await tick()
    const elapsed = performance.now() - start

    console.log(`    Added 500 items in ${elapsed.toFixed(2)}ms`)

    results.push({
      test: 'Bulk Add',
      metric: '500 items',
      value: `${elapsed.toFixed(2)}ms`
    })
  }

  // TEST 3: Bulk remove - remove all 500 items
  async function testBulkRemove() {
    phase = 'bulk-remove'
    currentTest = 'Bulk Remove Components'
    console.log('\n[3] Bulk Remove (500 items at once)')

    const start = performance.now()
    items = []
    await tick()
    const elapsed = performance.now() - start

    console.log(`    Removed 500 items in ${elapsed.toFixed(2)}ms`)

    results.push({
      test: 'Bulk Remove',
      metric: '500 items',
      value: `${elapsed.toFixed(2)}ms`
    })
  }

  // TEST 4: Concurrent updates - update 100 items simultaneously
  async function testConcurrentUpdates() {
    phase = 'concurrent'
    currentTest = 'Concurrent Updates'
    console.log('\n[4] Concurrent Updates (100 items, 50 rounds)')

    // Create 100 items
    items = Array.from({ length: 100 }, (_, i) => ({ id: i, value: 0 }))
    await tick()

    const times: number[] = []

    for (let round = 0; round < 50; round++) {
      const start = performance.now()
      // Update ALL items at once
      for (let i = 0; i < items.length; i++) {
        items[i].value++
      }
      await tick()
      times.push(performance.now() - start)
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length
    console.log(`    Avg time to update 100 items: ${avg.toFixed(2)}ms`)

    results.push({
      test: 'Concurrent',
      metric: '100 items/update',
      value: `${avg.toFixed(2)}ms`
    })

    items = []
  }

  // TEST 5: Churn - rapidly add and remove items
  async function testChurn() {
    phase = 'churn'
    currentTest = 'Add/Remove Churn'
    console.log('\n[5] Add/Remove Churn (100 cycles)')

    items = []
    const times: number[] = []

    for (let i = 0; i < 100; i++) {
      const start = performance.now()

      // Add 10 items
      const newItems = Array.from({ length: 10 }, (_, j) => ({
        id: i * 10 + j,
        value: 0
      }))
      items = [...items, ...newItems]
      await microtick()

      // Remove first 10 items (if we have enough)
      if (items.length > 20) {
        items = items.slice(10)
      }
      await microtick()

      times.push(performance.now() - start)
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length
    console.log(`    Avg churn cycle: ${avg.toFixed(2)}ms`)

    results.push({
      test: 'Churn',
      metric: 'Add+Remove cycle',
      value: `${avg.toFixed(2)}ms`
    })

    items = []
  }

  // TEST 6: Deep list - 1000 items
  async function testDeepList() {
    phase = 'deep'
    currentTest = 'Deep List (1000 items)'
    console.log('\n[6] Deep List (1000 items)')

    const renderStart = performance.now()
    items = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: 0 }))
    await tick()
    const renderTime = performance.now() - renderStart

    console.log(`    Render 1000 items: ${renderTime.toFixed(2)}ms`)

    // Update single item in deep list
    const updateTimes: number[] = []
    for (let i = 0; i < 50; i++) {
      const idx = Math.floor(Math.random() * 1000)
      const start = performance.now()
      items[idx].value++
      await tick()
      updateTimes.push(performance.now() - start)
    }

    const avgUpdate = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length
    console.log(`    Avg update in 1000 items: ${avgUpdate.toFixed(2)}ms`)

    results.push({
      test: 'Deep List',
      metric: 'Render 1000',
      value: `${renderTime.toFixed(2)}ms`
    })
    results.push({
      test: 'Deep List',
      metric: 'Update in 1000',
      value: `${avgUpdate.toFixed(2)}ms`
    })

    items = []
  }

  // TEST 7: Idle CPU
  async function testIdleCPU() {
    phase = 'idle'
    currentTest = 'Idle CPU Measurement'
    console.log('\n[7] Idle CPU (2 seconds)')

    items = Array.from({ length: 100 }, (_, i) => ({ id: i, value: i }))
    await tick()

    const startCpu = process.cpuUsage()
    const startTime = performance.now()

    // Just wait, no updates
    await new Promise(r => setTimeout(r, 2000))

    const endCpu = process.cpuUsage(startCpu)
    const elapsed = performance.now() - startTime
    const cpuPercent = ((endCpu.user + endCpu.system) / 1000 / elapsed) * 100

    console.log(`    Idle CPU usage: ${cpuPercent.toFixed(2)}%`)

    results.push({
      test: 'Idle',
      metric: 'CPU usage',
      value: `${cpuPercent.toFixed(2)}%`
    })

    items = []
  }

  // TEST 8: MASSIVE - 5000 items
  async function testMassive() {
    phase = 'massive'
    currentTest = 'MASSIVE List (5000 items)'
    console.log('\n[8] MASSIVE List (5000 items)')

    // Render 5000 items
    const renderStart = performance.now()
    items = Array.from({ length: 5000 }, (_, i) => ({ id: i, value: 0 }))
    await tick()
    const renderTime = performance.now() - renderStart

    console.log(`    Render 5000 items: ${renderTime.toFixed(2)}ms`)

    results.push({
      test: 'MASSIVE',
      metric: 'Render 5000',
      value: `${renderTime.toFixed(2)}ms`
    })

    // Single update in 5000 items
    const updateTimes: number[] = []
    for (let i = 0; i < 30; i++) {
      const idx = Math.floor(Math.random() * 5000)
      const start = performance.now()
      items[idx].value++
      await tick()
      updateTimes.push(performance.now() - start)
    }

    const avgUpdate = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length
    console.log(`    Avg update in 5000: ${avgUpdate.toFixed(2)}ms`)

    results.push({
      test: 'MASSIVE',
      metric: 'Update in 5000',
      value: `${avgUpdate.toFixed(2)}ms`
    })

    // Bulk update - update 500 items at once
    const bulkStart = performance.now()
    for (let i = 0; i < 500; i++) {
      items[i].value++
    }
    await tick()
    const bulkTime = performance.now() - bulkStart

    console.log(`    Bulk update 500/5000: ${bulkTime.toFixed(2)}ms`)

    results.push({
      test: 'MASSIVE',
      metric: 'Bulk 500/5000',
      value: `${bulkTime.toFixed(2)}ms`
    })

    // Clear
    const clearStart = performance.now()
    items = []
    await tick()
    const clearTime = performance.now() - clearStart

    console.log(`    Clear 5000 items: ${clearTime.toFixed(2)}ms`)

    results.push({
      test: 'MASSIVE',
      metric: 'Clear 5000',
      value: `${clearTime.toFixed(2)}ms`
    })
  }

  function tick() {
    return new Promise(r => setTimeout(r, 1))
  }

  function microtick() {
    return new Promise(r => setImmediate(r))
  }

  function printResults() {
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)

    console.log('\n' + '='.repeat(70))
    console.log('  STRESS TEST RESULTS')
    console.log('='.repeat(70))
    console.log('')
    console.log('  Test             | Metric            | Result')
    console.log('  ' + '-'.repeat(60))
    for (const r of results) {
      console.log(`  ${r.test.padEnd(16)} | ${r.metric.padEnd(17)} | ${r.value}`)
    }
    console.log('')
    console.log(`  Peak Memory: ${mem}MB`)
    console.log('='.repeat(70))
    console.log('  Press Ctrl+C to exit')
    console.log('='.repeat(70) + '\n')
  }
</script>

<Box width="100%" height="100%" flexDirection="column">
  <Box border="single" borderColor={0xf59e0b} padding={1} marginBottom={1}>
    <Text text="SvelTUI Stress Test" color={0xf59e0b} bold />
  </Box>

  <Box marginBottom={1}>
    <Text text={`Test: ${currentTest}`} color={0x94a3b8} />
  </Box>

  {#if phase === 'rapid'}
    <Text text={`Rapid updates: ${rapidCount}`} color={0x22c55e} />
  {/if}

  {#if items.length > 0 && phase !== 'rapid'}
    <Box flexDirection="column" height={8} overflow="hidden">
      {#each items.slice(0, 8) as item (item.id)}
        <Box flexDirection="row">
          <Text text={`[${item.id}] `} color={0x64748b} />
          <Text text={`${item.value}`} color={0x22c55e} />
        </Box>
      {/each}
    </Box>
    {#if items.length > 8}
      <Text text={`... +${items.length - 8} more items`} color={0x64748b} />
    {/if}
  {/if}

  {#if phase === 'done'}
    <Box marginY={1}>
      <Text text="Done! Check console for full results" color={0x22c55e} bold />
    </Box>
  {/if}
</Box>
