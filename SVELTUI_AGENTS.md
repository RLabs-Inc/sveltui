# SvelTUI Specialized Agents

## 1. sveltui-import-fixer

**Description**: Use this agent when you need to fix import path issues in SvelTUI components and examples. This includes adding missing .mjs extensions, fixing relative paths, and ensuring all compiled components can be properly imported.

**When to use**: 
- When you get "Cannot find module" errors
- When imports are missing .mjs extensions
- When components fail to load due to import issues
- When you need to standardize import patterns across the codebase

**What it does**:
- Systematically scans all files in examples/ and src/components/ui/
- Identifies imports of compiled Svelte components missing .mjs extensions
- Fixes both static imports (import X from './file') and dynamic imports
- Ensures all components export correctly
- Validates import paths resolve correctly

**Key rules it follows**:
- Compiled .svelte files become .svelte.mjs files
- All imports of compiled components need .mjs extension
- TypeScript files (.ts) don't need .mjs extension
- Regular JavaScript modules keep their original extensions

---

## 2. sveltui-render-debugger

**Description**: Use this agent when you encounter rendering issues in SvelTUI where content isn't displaying correctly in the terminal, when there's a mismatch between Happy DOM and blessed terminal elements, when reactive updates aren't syncing properly between Svelte and the terminal, or when you need to debug the DOM-to-terminal element mapping pipeline. This agent specializes in tracing the rendering flow from Svelte components through the virtual DOM to blessed terminal elements.

**When to use**:
- When components show "undefined" instead of content
- When terminal remains blank despite successful mounting
- When reactive updates don't appear in the terminal
- When you need to trace where content gets lost in the pipeline
- When Happy DOM elements aren't mapping to terminal elements correctly

**What it does**:
- Traces the complete rendering pipeline from Svelte mount to terminal display
- Debugs Happy DOM to terminal element bridge mapping
- Identifies where text content gets lost or transformed incorrectly
- Validates reactive synchronization between Svelte and terminal
- Adds strategic logging to pinpoint rendering failures
- Ensures blessed elements receive and display content properly

**Focus areas**:
- Happy DOM element creation and content setting
- Bridge function (happyDomToTerminal) mapping logic
- Text node content propagation
- Reactive update sync mechanism
- Blessed element content methods (setContent, setText)
- Screen rendering and refresh cycles

---

## 3. sveltui-example-standardizer

**Description**: Use this agent when you need to clean up and standardize the examples folder in SvelTUI. This includes reducing the number of examples to a core working set, ensuring consistent patterns, and creating a solid baseline of demonstrations that showcase the framework's capabilities.

**When to use**:
- When the examples folder has too many files (30+ examples)
- When you need to identify which examples actually work
- When you want to create a clean set of demo applications
- When examples follow inconsistent patterns

**What it does**:
- Audits all existing examples to identify working vs broken ones
- Reduces examples to 5-6 core demonstrations
- Ensures each example follows the same launcher pattern
- Removes duplicate or non-functional examples
- Creates clear, focused demos for each major feature
- Standardizes file naming and organization

**Core examples to maintain**:
1. **basic-counter** - Reactive state with $state and $derived
2. **interactive-list** - Keyboard navigation and selection
3. **text-input** - Two-way binding and form handling
4. **layout-demo** - Flexbox-style positioning and sizing
5. **style-states** - Hover, focus, and pressed styling
6. **event-handling** - Click, keyboard, and custom events

---

## 4. sveltui-component-validator

**Description**: Use this agent when you need to validate and fix all UI components in the SvelTUI component library. This includes ensuring proper compilation, correct exports, valid Svelte 5 syntax, and working terminal rendering for each component.

**When to use**:
- When components fail to compile
- When components don't export correctly
- When you need to ensure all components follow Svelte 5 best practices
- When adding new components to ensure consistency

**What it does**:
- Validates each component in src/components/ui/
- Ensures proper Svelte 5 rune usage (no state updates in $effect)
- Verifies TypeScript types and props interfaces
- Checks that components compile without errors
- Validates default exports and component signatures
- Tests basic rendering in isolation
- Ensures consistent coding patterns across components

**Validation checklist**:
- ✓ Compiles with scripts/compile-svelte.mjs
- ✓ Exports default correctly
- ✓ Props are properly typed with TypeScript
- ✓ No state updates inside $effect runes
- ✓ Renders visible content in terminal
- ✓ Follows established component patterns
- ✓ Has proper blessed element mapping

---

## Usage Instructions

1. Copy the description for the agent you want to create
2. When creating the agent in Claude, paste the description
3. The agent will have the context needed to perform its specialized task
4. Launch agents in this recommended order:
   - First: sveltui-example-standardizer (clean foundation)
   - Second: sveltui-import-fixer (fix import issues)
   - Third: sveltui-render-debugger (fix rendering)
   - Fourth: sveltui-component-validator (ensure all components work)

## Important Notes

- Each agent is specialized for a specific type of problem
- Agents work best when used for their intended purpose
- Some agents may need to be run multiple times as fixes are applied
- Always test changes after each agent completes its work