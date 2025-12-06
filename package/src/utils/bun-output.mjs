// @bun
// src/utils/bun-output.ts
function writeStdout(data) {
  if (typeof Bun !== "undefined" && Bun.write && Bun.stdout) {
    Bun.write(Bun.stdout, data);
  } else {
    process.stdout.write(data);
  }
}
function writeStderr(data) {
  if (typeof Bun !== "undefined" && Bun.write && Bun.stderr) {
    Bun.write(Bun.stderr, data);
  } else {
    process.stderr.write(data);
  }
}
function clearScreen() {
  writeStdout("\x1B[2J\x1B[H");
}
function moveCursor(x, y) {
  writeStdout(`\x1B[${y + 1};${x + 1}H`);
}
function hideCursor() {
  writeStdout("\x1B[?25l");
}
function showCursor() {
  writeStdout("\x1B[?25h");
}
function saveCursor() {
  writeStdout("\x1B[s");
}
function restoreCursor() {
  writeStdout("\x1B[u");
}
function enterAlternateScreen() {
  writeStdout("\x1B[?1049h");
}
function exitAlternateScreen() {
  writeStdout("\x1B[?1049l");
}
function reset() {
  writeStdout("\x1B[0m");
}
function enableRawMode() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
}
function disableRawMode() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
}
function writeFrame(ansiOutput) {
  writeStdout(ansiOutput);
}

class OutputBuffer {
  buffer = [];
  write(data) {
    this.buffer.push(data);
    return this;
  }
  clear() {
    this.buffer = [];
    return this;
  }
  flush() {
    if (this.buffer.length > 0) {
      writeStdout(this.buffer.join(""));
      this.buffer = [];
    }
  }
  toString() {
    return this.buffer.join("");
  }
}
export {
  writeStdout,
  writeStderr,
  writeFrame,
  showCursor,
  saveCursor,
  restoreCursor,
  reset,
  moveCursor,
  hideCursor,
  exitAlternateScreen,
  enterAlternateScreen,
  enableRawMode,
  disableRawMode,
  clearScreen,
  OutputBuffer
};
