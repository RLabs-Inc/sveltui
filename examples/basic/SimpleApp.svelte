/**
 * Simple SvelTUI Demo
 */

<script>
  // Count state using Svelte 5 runes
  let count = $state(0);
  
  // Function to increment the count
  function increment() {
    count++;
  }
  
  // Function to decrement the count
  function decrement() {
    if (count > 0) {
      count--;
    }
  }
</script>

<box border label="SvelTUI Simple Demo">
  <box top={1} left={2} width="50%" height={3} border>
    <text content={`Count: ${count}`} />
  </box>

  <box top={5} left="center" width={40} height={3}>
    <box left={0} width={15} height={3} border>
      <text 
        content=" + " 
        style={{ fg: 'white', bg: 'blue' }}
        onclick={increment}
      />
    </box>
    
    <box left={20} width={15} height={3} border>
      <text 
        content=" - " 
        style={{ fg: 'white', bg: 'red' }}
        onclick={decrement}
      />
    </box>
  </box>
  
  <text
    bottom={1}
    left="center"
    content="Press Q to exit | Click buttons to change count"
    style={{
      fg: "gray"
    }}
  />
</box>