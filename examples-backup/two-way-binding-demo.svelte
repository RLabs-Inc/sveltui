<!--
  Two-Way Binding Demo for SvelTUI
  
  Demonstrates:
  - Input field with bind:value
  - Checkbox with bind:checked  
  - List with bind:selected
  - Custom property bindings
  - Form state management with reactive updates
-->

<script>
  import { Box, Text, Input, Checkbox, List, Button } from '../src/components/ui/index.ts';
  
  // Form state with bindable properties
  let username = $state('');
  let email = $state('');
  let password = $state('');
  let rememberMe = $state(false);
  let acceptTerms = $state(false);
  let selectedCountry = $state(0);
  
  // Countries list
  const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'Other'];
  
  // Derived state
  let formValid = $derived(
    username.length >= 3 &&
    email.includes('@') &&
    password.length >= 6 &&
    acceptTerms
  );
  
  let formSummary = $derived(() => {
    const lines = [
      `Username: ${username || '(empty)'}`,
      `Email: ${email || '(empty)'}`,
      `Password: ${'*'.repeat(password.length) || '(empty)'}`,
      `Remember Me: ${rememberMe ? 'Yes' : 'No'}`,
      `Accept Terms: ${acceptTerms ? 'Yes' : 'No'}`,
      `Country: ${countries[selectedCountry]}`
    ];
    return lines.join('\n');
  });
  
  // Submit handler
  function handleSubmit() {
    if (!formValid) return;
    
    // In a real app, you'd submit the form here
    alert('Form submitted successfully!');
  }
  
  // Reset handler
  function handleReset() {
    username = '';
    email = '';
    password = '';
    rememberMe = false;
    acceptTerms = false;
    selectedCountry = 0;
  }
</script>

<Box width="100%" height="100%" border="line" label=" Two-Way Binding Demo ">
  <!-- Left side: Form inputs -->
  <Box left={1} top={1} width="50%-2" height="100%-2" border="line" label=" Registration Form ">
    <!-- Username input -->
    <Text left={1} top={1} bold>Username:</Text>
    <Input 
      bind:value={username}
      left={1} 
      top={2} 
      width="100%-2" 
      height={1}
      placeholder="Enter username (min 3 chars)"
      border
    />
    
    <!-- Email input -->
    <Text left={1} top={4} bold>Email:</Text>
    <Input 
      bind:value={email}
      left={1} 
      top={5} 
      width="100%-2" 
      height={1}
      placeholder="Enter email address"
      border
    />
    
    <!-- Password input -->
    <Text left={1} top={7} bold>Password:</Text>
    <Input 
      bind:value={password}
      left={1} 
      top={8} 
      width="100%-2" 
      height={1}
      placeholder="Enter password (min 6 chars)"
      secret
      border
    />
    
    <!-- Remember me checkbox -->
    <Checkbox 
      bind:checked={rememberMe}
      left={1} 
      top={10}
      label="Remember me"
    />
    
    <!-- Accept terms checkbox -->
    <Checkbox 
      bind:checked={acceptTerms}
      left={1} 
      top={12}
      label="I accept the terms and conditions"
    />
    
    <!-- Country selection -->
    <Text left={1} top={14} bold>Country:</Text>
    <List 
      bind:selected={selectedCountry}
      items={countries}
      left={1} 
      top={15} 
      width="100%-2" 
      height={8}
      border="line"
      selectedStyle={{ fg: 'white', bg: 'blue' }}
    />
    
    <!-- Form actions -->
    <Box left={1} bottom={1} width="100%-2" height={3}>
      <Button 
        left={0}
        content={formValid ? "Submit" : "Submit (Complete form)"}
        disabled={!formValid}
        style={{ bg: formValid ? 'green' : 'red' }}
        onPress={handleSubmit}
      />
      <Button 
        right={0}
        content="Reset"
        style={{ bg: 'yellow', fg: 'black' }}
        onPress={handleReset}
      />
    </Box>
  </Box>
  
  <!-- Right side: Live form state display -->
  <Box right={1} top={1} width="50%-2" height="100%-2" border="line" label=" Live Form State ">
    <Text left={1} top={1} bold>Form Data:</Text>
    <Text left={1} top={3}>{formSummary()}</Text>
    
    <Text left={1} top={10} bold>Validation Status:</Text>
    <Text 
      left={1} 
      top={11} 
      fg={username.length >= 3 ? 'green' : 'red'}
    >
      Username: {username.length >= 3 ? '✓ Valid' : '✗ Too short'}
    </Text>
    <Text 
      left={1} 
      top={12} 
      fg={email.includes('@') ? 'green' : 'red'}
    >
      Email: {email.includes('@') ? '✓ Valid' : '✗ Invalid'}
    </Text>
    <Text 
      left={1} 
      top={13} 
      fg={password.length >= 6 ? 'green' : 'red'}
    >
      Password: {password.length >= 6 ? '✓ Valid' : '✗ Too short'}
    </Text>
    <Text 
      left={1} 
      top={14} 
      fg={acceptTerms ? 'green' : 'red'}
    >
      Terms: {acceptTerms ? '✓ Accepted' : '✗ Not accepted'}
    </Text>
    
    <Text 
      left={1} 
      bottom={2} 
      bold
      fg={formValid ? 'green' : 'yellow'}
    >
      Form Status: {formValid ? 'Ready to submit!' : 'Please complete all fields'}
    </Text>
  </Box>
</Box>