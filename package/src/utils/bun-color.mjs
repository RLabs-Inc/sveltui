// @bun
// src/utils/bun-color.ts
function parseColor(input) {
  if (typeof Bun !== "undefined" && Bun.color) {
    const result = Bun.color(input, "number");
    return result !== null ? result : undefined;
  }
  if (typeof input === "number") {
    return input;
  }
  if (typeof input === "string") {
    if (input.startsWith("#")) {
      const hex = input.slice(1);
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return r << 16 | g << 8 | b;
      }
      if (hex.length === 6) {
        return parseInt(hex, 16);
      }
    }
    const basicColors = {
      red: 16711680,
      green: 65280,
      blue: 255,
      yellow: 16776960,
      cyan: 65535,
      magenta: 16711935,
      white: 16777215,
      black: 0,
      gray: 8421504,
      grey: 8421504
    };
    return basicColors[input.toLowerCase()];
  }
  if (Array.isArray(input) && input.length >= 3) {
    const [r, g, b] = input;
    return r << 16 | g << 8 | b;
  }
  if (typeof input === "object" && "r" in input && "g" in input && "b" in input) {
    return input.r << 16 | input.g << 8 | input.b;
  }
  return;
}
function toANSI(color, background = false) {
  if (typeof Bun !== "undefined" && Bun.color) {
    const ansi = Bun.color(color, "ansi");
    if (ansi === null)
      return "";
    if (background && ansi.includes("[38;")) {
      return ansi.replace("[38;", "[48;");
    }
    return ansi;
  }
  const num = parseColor(color);
  if (num === undefined)
    return "";
  const r = num >> 16 & 255;
  const g = num >> 8 & 255;
  const b = num & 255;
  return background ? `\x1B[48;2;${r};${g};${b}m` : `\x1B[38;2;${r};${g};${b}m`;
}
function toANSIWithDepth(color, depth = "16m", background = false) {
  if (typeof Bun !== "undefined" && Bun.color) {
    const format = `ansi-${depth}`;
    const ansi = Bun.color(color, format);
    if (ansi === null)
      return "";
    if (background && ansi.includes("[38;")) {
      return ansi.replace("[38;", "[48;");
    }
    return ansi;
  }
  return toANSI(color, background);
}
function toRGB(color) {
  if (typeof Bun !== "undefined" && Bun.color) {
    const result = Bun.color(color, "{rgb}");
    return result !== null ? result : undefined;
  }
  const num = parseColor(color);
  if (num === undefined)
    return;
  return {
    r: num >> 16 & 255,
    g: num >> 8 & 255,
    b: num & 255
  };
}
function toRGBA(color) {
  if (typeof Bun !== "undefined" && Bun.color) {
    const result = Bun.color(color, "{rgba}");
    return result !== null ? result : undefined;
  }
  const rgb = toRGB(color);
  return rgb ? { ...rgb, a: 1 } : undefined;
}
function getColorCode(color, background) {
  if (color === undefined) {
    return background ? "\x1B[49m" : "\x1B[39m";
  }
  if (color <= 15) {
    if (color <= 7) {
      return background ? `\x1B[${40 + color}m` : `\x1B[${30 + color}m`;
    } else {
      return background ? `\x1B[${100 + (color - 8)}m` : `\x1B[${90 + (color - 8)}m`;
    }
  } else if (color <= 255) {
    return background ? `\x1B[48;5;${color}m` : `\x1B[38;5;${color}m`;
  } else {
    return toANSI(color, background);
  }
}
function toHex(color, uppercase = false) {
  if (typeof Bun !== "undefined" && Bun.color) {
    const result = Bun.color(color, uppercase ? "HEX" : "hex");
    return result !== null ? result : undefined;
  }
  const num = parseColor(color);
  if (num === undefined)
    return;
  const hex = num.toString(16).padStart(6, "0");
  return uppercase ? `#${hex.toUpperCase()}` : `#${hex}`;
}
function mixColors(color1, color2, ratio = 0.5) {
  const rgb1 = toRGB(color1);
  const rgb2 = toRGB(color2);
  if (!rgb1 || !rgb2)
    return;
  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
  return r << 16 | g << 8 | b;
}
function lighten(color, amount = 0.1) {
  return mixColors(color, 16777215, amount);
}
function darken(color, amount = 0.1) {
  return mixColors(color, 0, amount);
}
function isValidColor(color) {
  if (typeof Bun !== "undefined" && Bun.color) {
    return Bun.color(color, "number") !== null;
  }
  return parseColor(color) !== undefined;
}
function ansiReset() {
  return "\x1B[0m";
}
function ansiColors(fg, bg) {
  let result = "";
  if (fg !== undefined) {
    result += toANSI(fg, false);
  }
  if (bg !== undefined) {
    result += toANSI(bg, true);
  }
  return result;
}
export {
  toRGBA,
  toRGB,
  toHex,
  toANSIWithDepth,
  toANSI,
  parseColor,
  mixColors,
  lighten,
  isValidColor,
  getColorCode,
  darken,
  ansiReset,
  ansiColors
};
