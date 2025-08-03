#!/bin/bash

# Find and compile all .svelte.ts files
echo "Compiling all .svelte.ts files..."

# Find all .svelte.ts files in src/
find src -name "*.svelte.ts" -type f | while read -r file; do
    echo "Compiling: $file"
    node scripts/compile-svelte-ts.mjs "$file"
done

echo "Done compiling .svelte.ts files!"