#!/usr/bin/env bun
/**
 * SvelTUI Version Bump Script
 * Increments patch version (0.0.1) across all files
 *
 * Usage: bun scripts/bump.mjs [--minor] [--major]
 */

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Colors for output
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
}

// Parse args
const args = process.argv.slice(2)
const bumpType = args.includes('--major') ? 'major'
              : args.includes('--minor') ? 'minor'
              : 'patch'

// Files to update with their version patterns
const FILES = [
  {
    path: 'package.json',
    pattern: /"version":\s*"(\d+\.\d+\.\d+)"/,
    replace: (v) => `"version": "${v}"`,
    desc: 'package version',
  },
  {
    path: 'scripts/package-source.mjs',
    pattern: /version:\s*'(\d+\.\d+\.\d+)'/,
    replace: (v) => `version: '${v}'`,
    desc: 'packaged source',
  },
  {
    path: 'sv-tui',
    pattern: /deps\['@rlabs-inc\/sveltui'\]\s*=\s*'\^(\d+\.\d+\.\d+)'/,
    replace: (v) => `deps['@rlabs-inc/sveltui'] = '^${v}'`,
    desc: 'scaffold dependency',
  },
  {
    path: 'sv-tui',
    pattern: /SvelTUI CLI\$\{c\.reset\} \$\{c\.gray\}v(\d+\.\d+\.\d+)/,
    replace: (v) => `SvelTUI CLI\${c.reset} \${c.gray}v${v}`,
    desc: 'CLI help version',
  },
  {
    path: 'sv-tui',
    pattern: /<Text text="SvelTUI v(\d+\.\d+\.\d+)"/,
    replace: (v) => `<Text text="SvelTUI v${v}"`,
    desc: 'dashboard template',
  },
]

function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number)

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`
  }
}

// Read current version from package.json
const pkgPath = join(ROOT, 'package.json')
const pkg = await Bun.file(pkgPath).json()
const currentVersion = pkg.version
const newVersion = bumpVersion(currentVersion, bumpType)

console.log(`\n${c.bold}${c.cyan}SvelTUI Version Bump${c.reset}\n`)
console.log(`  ${c.dim}Current:${c.reset} ${currentVersion}`)
console.log(`  ${c.green}${c.bold}New:${c.reset}     ${newVersion} ${c.dim}(${bumpType})${c.reset}\n`)

// Update each file
for (const file of FILES) {
  const filePath = join(ROOT, file.path)

  try {
    let content = await Bun.file(filePath).text()
    const match = content.match(file.pattern)

    if (match) {
      const oldVersion = match[1]
      content = content.replace(file.pattern, file.replace(newVersion))
      await Bun.write(filePath, content)
      console.log(`  ${c.green}✓${c.reset} ${file.path} ${c.dim}(${file.desc}: ${oldVersion} → ${newVersion})${c.reset}`)
    } else {
      console.log(`  ${c.yellow}⚠${c.reset} ${file.path} ${c.dim}(pattern not found for ${file.desc})${c.reset}`)
    }
  } catch (err) {
    console.log(`  ${c.yellow}⚠${c.reset} ${file.path} ${c.dim}(${err.message})${c.reset}`)
  }
}

console.log(`\n${c.green}${c.bold}✨ Version bumped to ${newVersion}${c.reset}`)
console.log(`\n${c.dim}Next steps:${c.reset}`)
console.log(`  ${c.cyan}bun run build${c.reset}`)
console.log(`  ${c.cyan}npm publish --access public${c.reset}\n`)
