# SvelTUI Rendering Pipeline Debug Summary

## Issue Found and Fixed

The main issue was that blessed wasn't detecting the terminal size properly when running under bun, resulting in screen dimensions of 1x1. This caused all elements to render incorrectly or not at all.

## Root Causes

1. **Terminal Size Detection**: When running under bun, `process.stdout.columns` and `process.stdout.rows` were returning 1, causing blessed to create a 1x1 screen.

2. **JSON Attribute Parsing**: Style and border attributes were being passed as JSON strings but not parsed properly, resulting in empty style objects.

3. **Style Override**: The style parsing logic was overriding already-parsed JSON styles with an empty object.

## Fixes Applied

1. **Force Terminal Size**: Added logic in `screen.ts` to force terminal size to 80x24 if detection returns 1x1:
   ```typescript
   if (process.stdout.columns === 1 || process.stdout.rows === 1) {
     process.stdout.columns = 80;
     process.stdout.rows = 24;
   }
   ```

2. **JSON Attribute Parsing**: Added JSON parsing for border and style attributes in `bridge.ts`:
   ```typescript
   if (['border', 'style'].includes(propName)) {
     try {
       value = JSON.parse(value)
     } catch (e) {
       // Keep as string if JSON parsing fails
     }
   }
   ```

3. **Style Handling**: Fixed style parsing to not override already-parsed JSON styles.

4. **Initial Render**: Added `screen.render()` call immediately after screen creation to establish dimensions.

## Verification

The test case now works correctly:
- Box renders with cyan border
- Text "Hello from Debug Test!" displays in yellow color
- Text is properly centered

## Remaining Tasks

1. Remove debug console.log statements from:
   - `src/renderer/bridge.ts`
   - `src/dom/factories.ts`
   - `src/renderer/text-sync-fix.ts`
   - `src/renderer/dom-sync.ts`
   - `src/renderer/render.ts`

2. Re-enable the commented-out imports for:
   - Reactive events system
   - Mouse state handling

3. Test with actual Svelte components once the reactive imports are fixed.

## Test Commands

```bash
# Test blessed directly (works)
bun examples/test-blessed-direct.ts

# Test with forced size (works)
bun examples/debug-force-size.ts

# Test with actual Svelte components (pending reactive fixes)
bun --conditions browser examples/basic-launcher.ts
```