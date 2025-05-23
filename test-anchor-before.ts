#!/usr/bin/env bun --conditions browser

/**
 * Test file to debug the anchor.before() issue
 */

import { setupBrowserGlobals } from './src/utils/browser-globals'
import { createDocument } from './src/dom/document'
import { TerminalComment, TerminalText, TerminalElement } from './src/dom/document'

// Setup browser globals
setupBrowserGlobals()

// Create a terminal document
const doc = createDocument()

console.log('=== Testing DOM Node Types ===')

// Test 1: Create different node types
const comment = doc.createComment('')
const text = doc.createTextNode('Hello')
const element = doc.createElement('div')

console.log('Comment node type:', comment.nodeType, 'has before():', typeof (comment as any).before)
console.log('Text node type:', text.nodeType, 'has before():', typeof (text as any).before)
console.log('Element node type:', element.nodeType, 'has before():', typeof (element as any).before)

// Test 2: Check if nodes have the before method
console.log('\n=== Checking before() method ===')
console.log('TerminalComment instance:', comment instanceof TerminalComment)
console.log('TerminalText instance:', text instanceof TerminalText)
console.log('TerminalElement instance:', element instanceof TerminalElement)

// Test 3: Try to use before() method
console.log('\n=== Testing before() method ===')

// Create a parent element
const parent = doc.createElement('box')
parent.appendChild(comment)

// Try to use before() on comment node
try {
  if (typeof (comment as any).before === 'function') {
    console.log('Comment has before() method')
    const newText = doc.createTextNode('Before comment')
    ;(comment as any).before(newText)
    console.log('Successfully called before() on comment')
  } else {
    console.log('Comment does NOT have before() method')
  }
} catch (error) {
  console.error('Error calling before() on comment:', error)
}

// Test 4: Check what Svelte expects
console.log('\n=== Svelte Template Expectations ===')

// Import Svelte's append function
import { append } from 'svelte/internal/client'

// Create an anchor (comment node) like Svelte does
const anchor = doc.createComment('')
const container = doc.createElement('div')
container.appendChild(anchor)

console.log('Anchor type:', anchor.constructor.name)
console.log('Anchor nodeType:', anchor.nodeType)
console.log('Anchor has before():', 'before' in anchor)

// Try Svelte's append
const textElement = doc.createElement('ttext')
textElement.setAttribute('content', 'Test content')

console.log('\n=== Attempting Svelte append ===')
try {
  append(anchor, textElement)
  console.log('Svelte append succeeded!')
} catch (error: any) {
  console.error('Svelte append failed:', error.message)
  console.error('Error stack:', error.stack)
}

// Test 5: Add before() method to comment nodes
console.log('\n=== Adding before() to TerminalComment ===')

// Check if we need to add before() to TerminalComment
if (!('before' in comment)) {
  console.log('Adding before() method to TerminalComment prototype...')
  
  // We'll need to modify the TerminalComment class
  console.log('TerminalComment needs before() method implementation')
}

console.log('\n=== Summary ===')
console.log('The issue is that TerminalComment nodes do not have a before() method.')
console.log('Svelte expects all DOM nodes to have DOM Level 4 methods like before() and after().')
console.log('We need to add these methods to TerminalComment class.')