// @bun
// src/dom/style-utils.ts
var TERMINAL_COLORS = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "gray",
  "grey",
  "brightred",
  "brightgreen",
  "brightyellow",
  "brightblue",
  "brightmagenta",
  "brightcyan",
  "brightwhite",
  "default"
];
var TEXT_ATTRIBUTES = [
  "bold",
  "underline",
  "blink",
  "inverse",
  "invisible",
  "italic"
];
var BORDER_TYPES = [
  "line",
  "bg",
  "ascii",
  "double",
  "single"
];
function parseColor(color) {
  if (!color)
    return;
  if (TERMINAL_COLORS.includes(color)) {
    return color;
  }
  if (color.startsWith("#")) {
    return color;
  }
  if (color.startsWith("rgb(")) {
    return color;
  }
  const num = parseInt(color, 10);
  if (!isNaN(num) && num >= 0 && num <= 255) {
    return color;
  }
  return color;
}
function parseStyleAttributes(attr) {
  const style = {};
  const parts = attr.split(",").map((s) => s.trim().toLowerCase());
  for (const part of parts) {
    if (TEXT_ATTRIBUTES.includes(part)) {
      style[part] = true;
      continue;
    }
    const color = parseColor(part);
    if (color) {
      style.fg = color;
    }
  }
  return style;
}
function parseBlessedStyle(blessed) {
  const style = {};
  if (blessed.fg)
    style.fg = parseColor(blessed.fg);
  if (blessed.bg)
    style.bg = parseColor(blessed.bg);
  if (blessed.bold)
    style.bold = blessed.bold;
  if (blessed.underline)
    style.underline = blessed.underline;
  if (blessed.blink)
    style.blink = blessed.blink;
  if (blessed.inverse)
    style.inverse = blessed.inverse;
  if (blessed.invisible)
    style.invisible = blessed.invisible;
  if (blessed.italic)
    style.italic = blessed.italic;
  if (blessed.border) {
    style.border = {};
    if (blessed.border.fg)
      style.border.fg = parseColor(blessed.border.fg);
    if (blessed.border.bg)
      style.border.bg = parseColor(blessed.border.bg);
    if (blessed.border.type)
      style.border.type = blessed.border.type;
    if (blessed.border.ch)
      style.border.ch = blessed.border.ch;
  }
  if (blessed.scrollbar) {
    style.scrollbar = {};
    if (blessed.scrollbar.fg)
      style.scrollbar.fg = parseColor(blessed.scrollbar.fg);
    if (blessed.scrollbar.bg)
      style.scrollbar.bg = parseColor(blessed.scrollbar.bg);
    if (blessed.scrollbar.track) {
      style.scrollbar.track = {};
      if (blessed.scrollbar.track.fg) {
        style.scrollbar.track.fg = parseColor(blessed.scrollbar.track.fg);
      }
      if (blessed.scrollbar.track.bg) {
        style.scrollbar.track.bg = parseColor(blessed.scrollbar.track.bg);
      }
      if (blessed.scrollbar.track.ch) {
        style.scrollbar.track.ch = blessed.scrollbar.track.ch;
      }
    }
  }
  if (blessed.label) {
    style.label = {};
    if (blessed.label.fg)
      style.label.fg = parseColor(blessed.label.fg);
    if (blessed.label.bg)
      style.label.bg = parseColor(blessed.label.bg);
    if (blessed.label.bold)
      style.label.bold = blessed.label.bold;
    if (blessed.label.underline)
      style.label.underline = blessed.label.underline;
  }
  if (blessed.focus)
    style.focus = parseBlessedStyle(blessed.focus);
  if (blessed.hover)
    style.hover = parseBlessedStyle(blessed.hover);
  return style;
}
function mergeStyles(...styles) {
  const result = {};
  for (const style of styles) {
    if (!style)
      continue;
    Object.keys(style).forEach((key) => {
      const value = style[key];
      if (value !== undefined && typeof value !== "object") {
        result[key] = value;
      }
    });
    if (style.border) {
      result.border = { ...result.border, ...style.border };
    }
    if (style.scrollbar) {
      result.scrollbar = {
        ...result.scrollbar,
        ...style.scrollbar,
        track: style.scrollbar.track ? { ...result.scrollbar?.track, ...style.scrollbar.track } : result.scrollbar?.track
      };
    }
    if (style.label) {
      result.label = { ...result.label, ...style.label };
    }
    if (style.focus) {
      result.focus = mergeStyles(result.focus, style.focus);
    }
    if (style.hover) {
      result.hover = mergeStyles(result.hover, style.hover);
    }
    if (style.pressed) {
      result.pressed = mergeStyles(result.pressed, style.pressed);
    }
  }
  return result;
}
function styleToString(style) {
  const parts = [];
  if (style.fg)
    parts.push(`color: ${style.fg}`);
  if (style.bg)
    parts.push(`background: ${style.bg}`);
  if (style.bold)
    parts.push("font-weight: bold");
  if (style.underline)
    parts.push("text-decoration: underline");
  if (style.italic)
    parts.push("font-style: italic");
  if (style.blink)
    parts.push("text-decoration: blink");
  if (style.inverse)
    parts.push("filter: invert(1)");
  if (style.invisible)
    parts.push("visibility: hidden");
  if (style.border) {
    if (style.border.fg)
      parts.push(`border-color: ${style.border.fg}`);
    if (style.border.type)
      parts.push(`border-style: ${style.border.type}`);
  }
  return parts.join("; ");
}
function createStyle(options) {
  const style = {};
  if (options.fg)
    style.fg = parseColor(options.fg);
  if (options.bg)
    style.bg = parseColor(options.bg);
  if (options.bold)
    style.bold = options.bold;
  if (options.underline)
    style.underline = options.underline;
  if (options.italic)
    style.italic = options.italic;
  if (options.blink)
    style.blink = options.blink;
  if (options.inverse)
    style.inverse = options.inverse;
  if (options.invisible)
    style.invisible = options.invisible;
  if (options.border) {
    if (typeof options.border === "boolean") {
      style.border = options.border ? { type: "line" } : undefined;
    } else if (typeof options.border === "string") {
      style.border = { fg: parseColor(options.border), type: "line" };
    } else {
      style.border = {
        fg: options.border.fg ? parseColor(options.border.fg) : undefined,
        type: options.border.type || "line"
      };
    }
  }
  return style;
}
function inheritStyles(parentStyle, childStyle, inheritableProps = ["fg", "bg"]) {
  const inherited = { ...childStyle };
  for (const prop of inheritableProps) {
    if (!(prop in childStyle) && prop in parentStyle) {
      inherited[prop] = parentStyle[prop];
    }
  }
  return inherited;
}
function applyTheme(style, theme) {
  return mergeStyles(style, theme.default || {});
}
export {
  styleToString,
  parseStyleAttributes,
  parseColor,
  parseBlessedStyle,
  mergeStyles,
  inheritStyles,
  createStyle,
  applyTheme,
  TEXT_ATTRIBUTES,
  TERMINAL_COLORS,
  BORDER_TYPES
};
