/**
 * SvelTUI Compiler Plugin
 *
 * This module provides a Svelte compiler plugin that transforms Svelte components
 * to render to the terminal instead of the DOM. It intercepts DOM operations
 * and replaces them with terminal-specific operations.
 */

import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { parse } from 'acorn'
import { handleNode } from './nodes'
import { transformDOMMethod } from './transform'
import type { ExtendedNode, ExtendedIdentifier } from './types'
import { isCallExpression } from './types'
import path from 'path'

/**
 * Options for the SvelTUI compiler plugin
 */
export interface SvelTUICompilerOptions {
  /** Whether to enable debug mode with additional logging */
  debug?: boolean

  /** Whether to add source maps */
  sourcemap?: boolean

  /** Custom element transformations */
  customElements?: Record<string, string>

  /** List of events to handle specially in the terminal */
  terminalEvents?: string[]

  /** Additional imports to add */
  additionalImports?: Record<string, string>
}

/**
 * The default compiler options
 */
const DEFAULT_OPTIONS: SvelTUICompilerOptions = {
  debug: false,
  sourcemap: true,
  customElements: {},
  terminalEvents: [
    'click',
    'mousedown',
    'mouseup',
    'mouseover',
    'mouseout',
    'keydown',
    'keyup',
    'keypress',
    'focus',
    'blur',
    'select',
    'submit',
    'change',
  ],
  additionalImports: {
    'svelte/internal': 'svelte/internal',
  },
}

/**
 * Creates the SvelTUI compiler plugin
 *
 * @param options - Plugin options
 * @returns The Svelte compiler plugin
 */
export function sveltuiPlugin(userOptions: SvelTUICompilerOptions = {}) {
  // Merge user options with defaults
  const options = { ...DEFAULT_OPTIONS, ...userOptions }

  return {
    name: 'sveltui',

    // Transform the compiled JavaScript code
    transform(code: string, id: string) {
      // Only process .svelte files
      if (!id.endsWith('.svelte') && !id.endsWith('.svelte.ts')) {
        return null
      }

      if (options.debug) {
        // console.log(`[SvelTUI] Processing: ${id}`)
      }

      // Create a MagicString instance for code manipulation
      const s = new MagicString(code)

      try {
        // Parse the code to get an AST
        const ast = parse(code, {
          ecmaVersion: 2020,
          sourceType: 'module',
        }) as unknown as ExtendedNode

        // Determine the proper path to the API runtime
        const runtimePath = getRelativeImportPath(id, '../api/runtime')

        // Add imports for our runtime DOM API
        s.prepend(`
// SvelTUI runtime imports
import {
  __sveltui_createElement,
  __sveltui_createTextNode,
  __sveltui_createComment,
  __sveltui_appendChild,
  __sveltui_insertBefore,
  __sveltui_removeChild,
  __sveltui_setAttribute,
  __sveltui_removeAttribute,
  __sveltui_setText,
  __sveltui_addEventListener,
  __sveltui_removeEventListener,
  __sveltui_document,
  __sveltui_window,
  __sveltui_root
} from '${runtimePath}';

`)

        // Transform DOM operations to terminal operations
        transformCode(ast, s, options)

        // Generate source map if needed
        const map = options.sourcemap ? s.generateMap({ hires: true }) : null

        // Return the transformed code
        return {
          code: s.toString(),
          map,
        }
      } catch (error) {
        console.error(`[SvelTUI] Error processing ${id}:`, error)
        return null
      }
    },
  }
}

/**
 * Determines the relative import path from a source file to a target module
 */
function getRelativeImportPath(
  sourceFilePath: string,
  targetModule: string
): string {
  // Default fallback path
  let runtimePath = targetModule

  // Check the file path to determine the correct relative path
  if (sourceFilePath.includes('/src/components/')) {
    // From components directory
    runtimePath = '../../api/runtime'
  } else if (sourceFilePath.includes('/examples/')) {
    // From examples directory
    runtimePath = '../src/api/runtime'
  } else if (sourceFilePath.includes('/src/')) {
    // From src directory
    const parts = sourceFilePath.split('/src/')[1].split('/')
    const depth = parts.length - 1
    runtimePath = '../'.repeat(depth) + 'api/runtime'
  }

  return runtimePath
}

/**
 * Transforms DOM operations to terminal operations
 *
 * @param ast - The code AST
 * @param s - MagicString instance for code manipulation
 * @param options - Compiler options
 */
function transformCode(
  ast: ExtendedNode,
  s: MagicString,
  options: SvelTUICompilerOptions
) {
  // Track which DOM operations we replace
  const replacedOperations = new Set<string>()

  // Replace references to document and window
  replaceGlobalReferences(s, ast)

  // We'll walk the AST and transform DOM operations to terminal operations
  walk(ast as any, {
    enter(node: any, parent: any) {
      // Cast to our extended type
      const extNode = node as ExtendedNode
      extNode.parent = parent
      if (options.debug) {
        // console.log(`[SvelTUI] Visiting node: ${extNode.type}`)
      }

      // Handle the node with our general handler
      if (handleNode(extNode, s)) {
        return
      }

      // Transform DOM method calls
      if (isCallExpression(extNode)) {
        if (transformDOMMethod(extNode, s)) {
          const callee = extNode.callee
          if (
            callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier'
          ) {
            replacedOperations.add(callee.property.name)
          }
        }
      }
    },
  })

  // Add code to initialize terminal UI after component is mounted
  appendInitializationCode(s, options)
}

/**
 * Replaces global references to document and window
 */
function replaceGlobalReferences(s: MagicString, ast: ExtendedNode): void {
  walk(ast as any, {
    enter(node: any, parent: any) {
      // Cast to our extended type
      const extNode = node as ExtendedNode
      extNode.parent = parent

      if (extNode.type === 'Identifier') {
        const idNode = extNode as ExtendedIdentifier
        if (
          (idNode.name === 'document' || idNode.name === 'window') &&
          // Make sure it's not part of a property access or import
          !(
            idNode.parent?.type === 'MemberExpression' &&
            (idNode.parent as any).property === idNode
          ) &&
          !(idNode.parent?.type === 'ImportSpecifier')
        ) {
          if (idNode.start !== undefined && idNode.end !== undefined) {
            s.overwrite(idNode.start, idNode.end, `__sveltui_${idNode.name}`)
          }
        }
      }
    },
  })
}

/**
 * Appends code to initialize terminal UI
 */
function appendInitializationCode(
  s: MagicString,
  options: SvelTUICompilerOptions
): void {
  // Add comment at the end to indicate the file was processed
  s.append(`
// SvelTUI: This file was processed by the SvelTUI compiler plugin
`)
}

/**
 * Maps HTML elements to terminal elements
 */
export const ELEMENT_MAP: Record<string, string> = {
  div: 'box',
  span: 'text',
  p: 'text',
  h1: 'text',
  h2: 'text',
  h3: 'text',
  h4: 'text',
  h5: 'text',
  h6: 'text',
  ul: 'list',
  ol: 'list',
  li: 'list-item',
  input: 'input',
  button: 'button',
  table: 'table',
  tr: 'table-row',
  td: 'table-cell',
  th: 'table-cell',
  progress: 'progress',
  form: 'form',
  label: 'text',
  select: 'list',
  option: 'list-item',
  textarea: 'textbox',
  // Add custom mappings for SvelTUI components
  box: 'box',
  text: 'text',
  list: 'list',
  checkbox: 'checkbox',
}

/**
 * Export the plugin for direct use
 */
export default sveltuiPlugin
