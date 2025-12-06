// @bun
// src/utils/ansi-codes.ts
var HIDE_CURSOR = "\x1B[?25l";
var SHOW_CURSOR = "\x1B[?25h";
var SAVE_CURSOR = "\x1B[s";
var RESTORE_CURSOR = "\x1B[u";
function moveTo(x, y) {
  return `\x1B[${y};${x}H`;
}
function moveUp(n = 1) {
  return `\x1B[${n}A`;
}
function moveDown(n = 1) {
  return `\x1B[${n}B`;
}
function moveRight(n = 1) {
  return `\x1B[${n}C`;
}
function moveLeft(n = 1) {
  return `\x1B[${n}D`;
}
var CLEAR_SCREEN = "\x1B[2J";
var CLEAR_LINE = "\x1B[2K";
var CLEAR_TO_END_OF_LINE = "\x1B[K";
var CLEAR_TO_END_OF_SCREEN = "\x1B[J";
var ENTER_ALT_SCREEN = "\x1B[?1049h";
var EXIT_ALT_SCREEN = "\x1B[?1049l";
var RESET = "\x1B[0m";
function setFgColor(hex) {
  const r = hex >> 16 & 255;
  const g = hex >> 8 & 255;
  const b = hex & 255;
  return `\x1B[38;2;${r};${g};${b}m`;
}
function setBgColor(hex) {
  const r = hex >> 16 & 255;
  const g = hex >> 8 & 255;
  const b = hex & 255;
  return `\x1B[48;2;${r};${g};${b}m`;
}
function setFg256(color) {
  return `\x1B[38;5;${color}m`;
}
function setBg256(color) {
  return `\x1B[48;5;${color}m`;
}
var FG_BLACK = "\x1B[30m";
var FG_RED = "\x1B[31m";
var FG_GREEN = "\x1B[32m";
var FG_YELLOW = "\x1B[33m";
var FG_BLUE = "\x1B[34m";
var FG_MAGENTA = "\x1B[35m";
var FG_CYAN = "\x1B[36m";
var FG_WHITE = "\x1B[37m";
var BG_BLACK = "\x1B[40m";
var BG_RED = "\x1B[41m";
var BG_GREEN = "\x1B[42m";
var BG_YELLOW = "\x1B[43m";
var BG_BLUE = "\x1B[44m";
var BG_MAGENTA = "\x1B[45m";
var BG_CYAN = "\x1B[46m";
var BG_WHITE = "\x1B[47m";
var BOLD = "\x1B[1m";
var DIM = "\x1B[2m";
var ITALIC = "\x1B[3m";
var UNDERLINE = "\x1B[4m";
var BLINK = "\x1B[5m";
var REVERSE = "\x1B[7m";
var HIDDEN = "\x1B[8m";
var STRIKETHROUGH = "\x1B[9m";
var StyleFlags = {
  BOLD: 1 << 0,
  DIM: 1 << 1,
  ITALIC: 1 << 2,
  UNDERLINE: 1 << 3,
  BLINK: 1 << 4,
  REVERSE: 1 << 5,
  HIDDEN: 1 << 6,
  STRIKETHROUGH: 1 << 7
};
function setTextStyle(style) {
  const codes = [];
  if (style & StyleFlags.BOLD)
    codes.push(BOLD);
  if (style & StyleFlags.DIM)
    codes.push(DIM);
  if (style & StyleFlags.ITALIC)
    codes.push(ITALIC);
  if (style & StyleFlags.UNDERLINE)
    codes.push(UNDERLINE);
  if (style & StyleFlags.BLINK)
    codes.push(BLINK);
  if (style & StyleFlags.REVERSE)
    codes.push(REVERSE);
  if (style & StyleFlags.HIDDEN)
    codes.push(HIDDEN);
  if (style & StyleFlags.STRIKETHROUGH)
    codes.push(STRIKETHROUGH);
  return codes.join("");
}
var ENABLE_MOUSE = "\x1B[?1000h\x1B[?1002h\x1B[?1003h\x1B[?1006h";
var DISABLE_MOUSE = "\x1B[?1000l\x1B[?1002l\x1B[?1003l\x1B[?1006l";
function setScrollRegion(top, bottom) {
  return `\x1B[${top};${bottom}r`;
}
function scrollUp(n = 1) {
  return `\x1B[${n}S`;
}
function scrollDown(n = 1) {
  return `\x1B[${n}T`;
}
export {
  setTextStyle,
  setScrollRegion,
  setFgColor,
  setFg256,
  setBgColor,
  setBg256,
  scrollUp,
  scrollDown,
  moveUp,
  moveTo,
  moveRight,
  moveLeft,
  moveDown,
  UNDERLINE,
  StyleFlags,
  STRIKETHROUGH,
  SHOW_CURSOR,
  SAVE_CURSOR,
  REVERSE,
  RESTORE_CURSOR,
  RESET,
  ITALIC,
  HIDE_CURSOR,
  HIDDEN,
  FG_YELLOW,
  FG_WHITE,
  FG_RED,
  FG_MAGENTA,
  FG_GREEN,
  FG_CYAN,
  FG_BLUE,
  FG_BLACK,
  EXIT_ALT_SCREEN,
  ENTER_ALT_SCREEN,
  ENABLE_MOUSE,
  DISABLE_MOUSE,
  DIM,
  CLEAR_TO_END_OF_SCREEN,
  CLEAR_TO_END_OF_LINE,
  CLEAR_SCREEN,
  CLEAR_LINE,
  BOLD,
  BLINK,
  BG_YELLOW,
  BG_WHITE,
  BG_RED,
  BG_MAGENTA,
  BG_GREEN,
  BG_CYAN,
  BG_BLUE,
  BG_BLACK
};
