// ============================================================================
// SVELTUI - BUN OPTIMIZED OUTPUT UTILITIES
// Fast terminal output using Bun's native write APIs
// ============================================================================

declare namespace Bun {
  const stdout: any;
  const stderr: any;
  function write(fd: any, data: string | Uint8Array): void;
}

/**
 * Write to stdout using Bun's optimized write function
 * Faster than process.stdout.write
 */
export function writeStdout(data: string | Uint8Array): void {
  if (typeof Bun !== 'undefined' && Bun.write && Bun.stdout) {
    Bun.write(Bun.stdout, data)
  } else {
    // Fallback to Node.js
    process.stdout.write(data)
  }
}

/**
 * Write to stderr using Bun's optimized write function
 */
export function writeStderr(data: string | Uint8Array): void {
  if (typeof Bun !== 'undefined' && Bun.write && Bun.stderr) {
    Bun.write(Bun.stderr, data)
  } else {
    // Fallback to Node.js
    process.stderr.write(data)
  }
}

/**
 * Clear the terminal screen
 */
export function clearScreen(): void {
  writeStdout('\x1b[2J\x1b[H')
}

/**
 * Move cursor to position
 */
export function moveCursor(x: number, y: number): void {
  writeStdout(`\x1b[${y + 1};${x + 1}H`)
}

/**
 * Hide cursor
 */
export function hideCursor(): void {
  writeStdout('\x1b[?25l')
}

/**
 * Show cursor
 */
export function showCursor(): void {
  writeStdout('\x1b[?25h')
}

/**
 * Save cursor position
 */
export function saveCursor(): void {
  writeStdout('\x1b[s')
}

/**
 * Restore cursor position
 */
export function restoreCursor(): void {
  writeStdout('\x1b[u')
}

/**
 * Enter alternate screen buffer
 */
export function enterAlternateScreen(): void {
  writeStdout('\x1b[?1049h')
}

/**
 * Exit alternate screen buffer
 */
export function exitAlternateScreen(): void {
  writeStdout('\x1b[?1049l')
}

/**
 * Reset all terminal attributes
 */
export function reset(): void {
  writeStdout('\x1b[0m')
}

/**
 * Enable raw mode for the terminal
 */
export function enableRawMode(): void {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }
}

/**
 * Disable raw mode for the terminal
 */
export function disableRawMode(): void {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false)
  }
}

/**
 * Write a complete frame to the terminal with optimizations
 */
export function writeFrame(ansiOutput: string): void {
  // Use Bun's optimized write for better performance
  writeStdout(ansiOutput)
}

/**
 * Batch multiple writes into a single operation
 */
export class OutputBuffer {
  private buffer: string[] = []
  
  /**
   * Add data to the buffer
   */
  write(data: string): this {
    this.buffer.push(data)
    return this
  }
  
  /**
   * Clear the buffer without writing
   */
  clear(): this {
    this.buffer = []
    return this
  }
  
  /**
   * Flush the buffer to stdout
   */
  flush(): void {
    if (this.buffer.length > 0) {
      writeStdout(this.buffer.join(''))
      this.buffer = []
    }
  }
  
  /**
   * Get the current buffer content without clearing
   */
  toString(): string {
    return this.buffer.join('')
  }
}