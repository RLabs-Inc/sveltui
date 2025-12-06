#!/usr/bin/env bun
// @bun

// src/test/terminal-width-test.ts
console.log("Terminal Width Debug:");
console.log("=====================");
console.log(`process.stdout.columns: ${process.stdout.columns}`);
console.log(`process.stdout.rows: ${process.stdout.rows}`);
console.log(`process.stdout.isTTY: ${process.stdout.isTTY}`);
var width = process.stdout.columns || 80;
console.log(`
Testing width ${width}:`);
process.stdout.write("\x1B[2K");
process.stdout.write("\x1B[1G");
for (let i = 0;i < width; i++) {
  process.stdout.write((i % 10).toString());
}
console.log(`

Above should show 0-9 repeating to fill the width`);
console.log("If the last digit is cut off, terminal reports wrong width");
console.log(`

Border test:`);
process.stdout.write("\x1B[2K\x1B[1G");
process.stdout.write("\u250C");
for (let i = 0;i < width - 2; i++) {
  process.stdout.write("\u2500");
}
process.stdout.write("\u2510");
console.log(`

If the right corner \u2510 is missing, the width is wrong`);
console.log(`

ANSI position test:`);
process.stdout.write("\x1B[2K");
process.stdout.write(`\x1B[${width}G`);
process.stdout.write("X");
console.log(`

If X is not visible at the right edge, ANSI positioning fails at reported width`);
console.log(`

Visual ruler:`);
var ruler1 = "";
var ruler2 = "";
for (let i = 0;i < width; i++) {
  if (i % 10 === 0) {
    ruler1 += Math.floor(i / 10).toString();
    ruler2 += "0";
  } else {
    ruler1 += " ";
    ruler2 += (i % 10).toString();
  }
}
console.log(ruler1);
console.log(ruler2);
console.log(`

The ruler should reach the right edge of your terminal`);
console.log("Check if the last number is visible");
