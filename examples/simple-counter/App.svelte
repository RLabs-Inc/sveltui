<!-- Simple Counter Example -->
<script>
  // Use Svelte 5 $state for reactivity
  let count = $state(0);
  
  // Function to increment the counter
  function increment() {
    count++;
  }
  
  // Function to decrement the counter
  function decrement() {
    if (count > 0) {
      count--;
    }
  }
</script>

<box border label="SvelTUI Counter Demo" width="100%" height="100%">
  <box top={2} left="center" width={30} height={3} border>
    <text content={`Count: ${count}`} bold />
  </box>
  
  <box top={6} left="center" width={50} height={3}>
    <box left={0} width={20} height={3} border>
      <text 
        content=" + " 
        style={{ fg: 'white', bg: 'blue' }}
        onclick={increment}
      />
    </box>
    
    <box left={25} width={20} height={3} border>
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
    style={{ fg: "gray" }}
  />
</box>