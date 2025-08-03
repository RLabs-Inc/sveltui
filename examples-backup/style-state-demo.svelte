<script>
  import { createStyleState, StyleState } from '../src/dom/style-state.svelte.ts'
  import { createStyle, mergeStyles } from '../src/dom/style-utils'
  
  // Create style states for different components
  const buttonStyle = createStyleState({
    normal: createStyle({
      fg: 'white',
      bg: 'blue',
      border: { fg: 'white', type: 'line' }
    }),
    hover: createStyle({
      bg: 'cyan',
      bold: true
    }),
    focus: createStyle({
      border: { fg: 'yellow' }
    }),
    pressed: createStyle({
      bg: 'magenta',
      inverse: true
    })
  })
  
  const textStyle = createStyleState({
    normal: createStyle({
      fg: 'green'
    }),
    hover: createStyle({
      fg: 'brightgreen',
      underline: true
    })
  })
  
  const boxStyle = createStyleState({
    normal: createStyle({
      border: { fg: 'gray', type: 'line' }
    }),
    focus: createStyle({
      border: { fg: 'white', type: 'double' }
    })
  })
  
  // State for interactive elements
  let selectedButton = $state(0)
  let inputValue = $state('')
  let checkboxChecked = $state(false)
  
  // Handle button clicks
  function handleButtonClick(index) {
    selectedButton = index
  }
  
  // Handle focus changes
  function handleFocus(styleState) {
    return () => styleState.setFocused(true)
  }
  
  function handleBlur(styleState) {
    return () => styleState.setFocused(false)
  }
  
  // Handle mouse events
  function handleMouseOver(styleState) {
    return () => styleState.setHovered(true)
  }
  
  function handleMouseOut(styleState) {
    return () => styleState.setHovered(false)
  }
  
  function handleMouseDown(styleState) {
    return () => styleState.setPressed(true)
  }
  
  function handleMouseUp(styleState) {
    return () => styleState.setPressed(false)
  }
</script>

<box 
  label="Style State Demo"
  width="100%"
  height="100%"
  style={boxStyle.blessedStyle}
  onfocus={handleFocus(boxStyle)}
  onblur={handleBlur(boxStyle)}
  keys={true}
  mouse={true}
>
  <!-- Title -->
  <text
    top={0}
    left="center"
    content="SvelTUI Style State Machine Demo"
    style={{ fg: 'yellow', bold: true }}
  />
  
  <!-- Interactive buttons with style states -->
  <box top={2} left={2} width="50%" height={10} label="Interactive Buttons">
    <button
      top={1}
      left={1}
      width={20}
      height={3}
      content="Button 1"
      style={buttonStyle.blessedStyle}
      onmouseover={handleMouseOver(buttonStyle)}
      onmouseout={handleMouseOut(buttonStyle)}
      onmousedown={handleMouseDown(buttonStyle)}
      onmouseup={handleMouseUp(buttonStyle)}
      onfocus={handleFocus(buttonStyle)}
      onblur={handleBlur(buttonStyle)}
      onclick={() => handleButtonClick(0)}
      mouse={true}
      keys={true}
    />
    
    <button
      top={4}
      left={1}
      width={20}
      height={3}
      content="Button 2"
      style={buttonStyle.blessedStyle}
      onmouseover={handleMouseOver(buttonStyle)}
      onmouseout={handleMouseOut(buttonStyle)}
      onmousedown={handleMouseDown(buttonStyle)}
      onmouseup={handleMouseUp(buttonStyle)}
      onfocus={handleFocus(buttonStyle)}
      onblur={handleBlur(buttonStyle)}
      onclick={() => handleButtonClick(1)}
      mouse={true}
      keys={true}
    />
    
    <text
      top={7}
      left={1}
      content={`Selected: Button ${selectedButton + 1}`}
      style={{ fg: 'cyan' }}
    />
  </box>
  
  <!-- Text with hover effects -->
  <box top={2} right={2} width="45%" height={10} label="Hover Text">
    <text
      top={1}
      left={1}
      content="Hover over me!"
      style={textStyle.blessedStyle}
      onmouseover={handleMouseOver(textStyle)}
      onmouseout={handleMouseOut(textStyle)}
      mouse={true}
    />
    
    <text
      top={3}
      left={1}
      content="Current style:"
      style={{ fg: 'gray' }}
    />
    
    <text
      top={4}
      left={1}
      content={`fg: ${textStyle.currentStyle.fg || 'default'}`}
      style={{ fg: 'white' }}
    />
    
    <text
      top={5}
      left={1}
      content={`underline: ${textStyle.currentStyle.underline || false}`}
      style={{ fg: 'white' }}
    />
  </box>
  
  <!-- Input with focus styles -->
  <box top={13} left={2} width="50%" height={8} label="Focus Input">
    <textbox
      top={1}
      left={1}
      width="90%"
      height={3}
      value={inputValue}
      onsubmit={(value) => inputValue = value}
      style={{
        fg: 'white',
        bg: 'black',
        focus: {
          bg: 'blue',
          fg: 'white'
        }
      }}
      keys={true}
      mouse={true}
      inputOnFocus={true}
    />
    
    <text
      top={4}
      left={1}
      content={`Value: ${inputValue || '(empty)'}`}
      style={{ fg: 'yellow' }}
    />
  </box>
  
  <!-- Checkbox with state -->
  <box top={13} right={2} width="45%" height={8} label="Stateful Checkbox">
    <checkbox
      top={1}
      left={1}
      checked={checkboxChecked}
      text="Enable feature"
      oncheck={() => checkboxChecked = !checkboxChecked}
      style={{
        fg: 'white',
        focus: {
          fg: 'cyan'
        }
      }}
      mouse={true}
      keys={true}
    />
    
    <text
      top={3}
      left={1}
      content={`Status: ${checkboxChecked ? 'Enabled' : 'Disabled'}`}
      style={{ fg: checkboxChecked ? 'green' : 'red' }}
    />
  </box>
  
  <!-- Instructions -->
  <box bottom={0} width="100%" height={3} style={{ border: { fg: 'gray' } }}>
    <text
      top={0}
      left="center"
      content="Use mouse to hover, click to interact, Tab to focus"
      style={{ fg: 'gray' }}
    />
  </box>
</box>