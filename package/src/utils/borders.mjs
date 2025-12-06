// @bun
// src/utils/borders.ts
var BORDERS = {
  single: {
    topLeft: "\u250C".charCodeAt(0),
    topRight: "\u2510".charCodeAt(0),
    bottomLeft: "\u2514".charCodeAt(0),
    bottomRight: "\u2518".charCodeAt(0),
    horizontal: "\u2500".charCodeAt(0),
    vertical: "\u2502".charCodeAt(0),
    topT: "\u252C".charCodeAt(0),
    bottomT: "\u2534".charCodeAt(0),
    leftT: "\u251C".charCodeAt(0),
    rightT: "\u2524".charCodeAt(0),
    cross: "\u253C".charCodeAt(0)
  },
  double: {
    topLeft: "\u2554".charCodeAt(0),
    topRight: "\u2557".charCodeAt(0),
    bottomLeft: "\u255A".charCodeAt(0),
    bottomRight: "\u255D".charCodeAt(0),
    horizontal: "\u2550".charCodeAt(0),
    vertical: "\u2551".charCodeAt(0),
    topT: "\u2566".charCodeAt(0),
    bottomT: "\u2569".charCodeAt(0),
    leftT: "\u2560".charCodeAt(0),
    rightT: "\u2563".charCodeAt(0),
    cross: "\u256C".charCodeAt(0)
  },
  rounded: {
    topLeft: "\u256D".charCodeAt(0),
    topRight: "\u256E".charCodeAt(0),
    bottomLeft: "\u2570".charCodeAt(0),
    bottomRight: "\u256F".charCodeAt(0),
    horizontal: "\u2500".charCodeAt(0),
    vertical: "\u2502".charCodeAt(0),
    topT: "\u252C".charCodeAt(0),
    bottomT: "\u2534".charCodeAt(0),
    leftT: "\u251C".charCodeAt(0),
    rightT: "\u2524".charCodeAt(0),
    cross: "\u253C".charCodeAt(0)
  },
  heavy: {
    topLeft: "\u250F".charCodeAt(0),
    topRight: "\u2513".charCodeAt(0),
    bottomLeft: "\u2517".charCodeAt(0),
    bottomRight: "\u251B".charCodeAt(0),
    horizontal: "\u2501".charCodeAt(0),
    vertical: "\u2503".charCodeAt(0),
    topT: "\u2533".charCodeAt(0),
    bottomT: "\u253B".charCodeAt(0),
    leftT: "\u2523".charCodeAt(0),
    rightT: "\u252B".charCodeAt(0),
    cross: "\u254B".charCodeAt(0)
  },
  dashed: {
    topLeft: "\u250C".charCodeAt(0),
    topRight: "\u2510".charCodeAt(0),
    bottomLeft: "\u2514".charCodeAt(0),
    bottomRight: "\u2518".charCodeAt(0),
    horizontal: "\u254C".charCodeAt(0),
    vertical: "\u254E".charCodeAt(0),
    topT: "\u252C".charCodeAt(0),
    bottomT: "\u2534".charCodeAt(0),
    leftT: "\u251C".charCodeAt(0),
    rightT: "\u2524".charCodeAt(0),
    cross: "\u253C".charCodeAt(0)
  },
  dotted: {
    topLeft: "\xB7".charCodeAt(0),
    topRight: "\xB7".charCodeAt(0),
    bottomLeft: "\xB7".charCodeAt(0),
    bottomRight: "\xB7".charCodeAt(0),
    horizontal: "\xB7".charCodeAt(0),
    vertical: "\xB7".charCodeAt(0),
    topT: "\xB7".charCodeAt(0),
    bottomT: "\xB7".charCodeAt(0),
    leftT: "\xB7".charCodeAt(0),
    rightT: "\xB7".charCodeAt(0),
    cross: "\xB7".charCodeAt(0)
  },
  ascii: {
    topLeft: 43,
    topRight: 43,
    bottomLeft: 43,
    bottomRight: 43,
    horizontal: 45,
    vertical: 124,
    topT: 43,
    bottomT: 43,
    leftT: 43,
    rightT: 43,
    cross: 43
  },
  block: {
    topLeft: "\u2588".charCodeAt(0),
    topRight: "\u2588".charCodeAt(0),
    bottomLeft: "\u2588".charCodeAt(0),
    bottomRight: "\u2588".charCodeAt(0),
    horizontal: "\u2588".charCodeAt(0),
    vertical: "\u2588".charCodeAt(0),
    topT: "\u2588".charCodeAt(0),
    bottomT: "\u2588".charCodeAt(0),
    leftT: "\u2588".charCodeAt(0),
    rightT: "\u2588".charCodeAt(0),
    cross: "\u2588".charCodeAt(0)
  },
  mixedDoubleH: {
    topLeft: "\u2552".charCodeAt(0),
    topRight: "\u2555".charCodeAt(0),
    bottomLeft: "\u2558".charCodeAt(0),
    bottomRight: "\u255B".charCodeAt(0),
    horizontal: "\u2550".charCodeAt(0),
    vertical: "\u2502".charCodeAt(0),
    topT: "\u2564".charCodeAt(0),
    bottomT: "\u2567".charCodeAt(0),
    leftT: "\u255E".charCodeAt(0),
    rightT: "\u2561".charCodeAt(0),
    cross: "\u256A".charCodeAt(0)
  },
  mixedDoubleV: {
    topLeft: "\u2553".charCodeAt(0),
    topRight: "\u2556".charCodeAt(0),
    bottomLeft: "\u2559".charCodeAt(0),
    bottomRight: "\u255C".charCodeAt(0),
    horizontal: "\u2500".charCodeAt(0),
    vertical: "\u2551".charCodeAt(0),
    topT: "\u2565".charCodeAt(0),
    bottomT: "\u2568".charCodeAt(0),
    leftT: "\u255F".charCodeAt(0),
    rightT: "\u2562".charCodeAt(0),
    cross: "\u256B".charCodeAt(0)
  }
};
function getBorderChars(style) {
  if (typeof style === "string") {
    return BORDERS[style] || BORDERS.single;
  }
  return style;
}
function createBorderChars(chars) {
  return {
    topLeft: chars.topLeft.charCodeAt(0),
    topRight: chars.topRight.charCodeAt(0),
    bottomLeft: chars.bottomLeft.charCodeAt(0),
    bottomRight: chars.bottomRight.charCodeAt(0),
    horizontal: chars.horizontal.charCodeAt(0),
    vertical: chars.vertical.charCodeAt(0),
    topT: chars.topT?.charCodeAt(0),
    bottomT: chars.bottomT?.charCodeAt(0),
    leftT: chars.leftT?.charCodeAt(0),
    rightT: chars.rightT?.charCodeAt(0),
    cross: chars.cross?.charCodeAt(0)
  };
}
function borderStyleFromNumber(style) {
  switch (style) {
    case 1:
      return "single";
    case 2:
      return "double";
    case 3:
      return "rounded";
    case 4:
      return "heavy";
    case 5:
      return "dashed";
    case 6:
      return "dotted";
    case 7:
      return "ascii";
    case 8:
      return "block";
    default:
      return "single";
  }
}
function borderStyleToNumber(style) {
  const map = {
    single: 1,
    double: 2,
    rounded: 3,
    heavy: 4,
    dashed: 5,
    dotted: 6,
    ascii: 7,
    block: 8,
    mixedDoubleH: 9,
    mixedDoubleV: 10
  };
  return map[style] || 1;
}
var borders_default = {
  BORDERS,
  getBorderChars,
  createBorderChars,
  borderStyleFromNumber,
  borderStyleToNumber
};
export {
  getBorderChars,
  borders_default as default,
  createBorderChars,
  borderStyleToNumber,
  borderStyleFromNumber,
  BORDERS
};
