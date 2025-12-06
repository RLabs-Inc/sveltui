// @bun
// src/utils/bun-text.ts
function getStringWidth(text, countAnsi = false) {
  if (typeof Bun !== "undefined" && Bun.stringWidth) {
    return Bun.stringWidth(text, { countAnsiEscapeCodes: countAnsi });
  }
  return text.length;
}
function stripANSI(text) {
  if (typeof Bun !== "undefined" && Bun.stripANSI) {
    return Bun.stripANSI(text);
  }
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}
function measureText(text) {
  const clean = stripANSI(text);
  return getStringWidth(clean);
}
function wrapTextAccurate(text, width) {
  if (!text || width <= 0)
    return [];
  const lines = [];
  const paragraphs = text.split(`
`);
  for (const paragraph of paragraphs) {
    if (paragraph.length === 0) {
      lines.push("");
      continue;
    }
    if (measureText(paragraph) <= width) {
      lines.push(paragraph);
      continue;
    }
    let currentLine = "";
    let currentWidth = 0;
    const words = paragraph.split(" ");
    for (let i = 0;i < words.length; i++) {
      const word = words[i];
      const wordWidth = measureText(word);
      if (wordWidth > width) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
          currentWidth = 0;
        }
        let wordPart = "";
        let partWidth = 0;
        for (const char of word) {
          const charWidth = measureText(char);
          if (partWidth + charWidth > width) {
            if (wordPart) {
              lines.push(wordPart);
              wordPart = "";
              partWidth = 0;
            }
          }
          wordPart += char;
          partWidth += charWidth;
        }
        if (wordPart) {
          lines.push(wordPart);
        }
        continue;
      }
      const spaceWidth = currentLine ? 1 : 0;
      if (currentWidth + spaceWidth + wordWidth <= width) {
        if (currentLine) {
          currentLine += " ";
          currentWidth += 1;
        }
        currentLine += word;
        currentWidth += wordWidth;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = wordWidth;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  return lines;
}
function truncateText(text, maxWidth, ellipsis = "...") {
  const clean = stripANSI(text);
  const textWidth = getStringWidth(clean);
  if (textWidth <= maxWidth) {
    return text;
  }
  const ellipsisWidth = getStringWidth(ellipsis);
  const targetWidth = maxWidth - ellipsisWidth;
  if (targetWidth <= 0) {
    return ellipsis.slice(0, maxWidth);
  }
  let truncated = "";
  let currentWidth = 0;
  for (const char of clean) {
    const charWidth = getStringWidth(char);
    if (currentWidth + charWidth > targetWidth) {
      break;
    }
    truncated += char;
    currentWidth += charWidth;
  }
  return truncated + ellipsis;
}
function centerText(text, width) {
  const textWidth = measureText(text);
  if (textWidth >= width) {
    return text;
  }
  const totalPadding = width - textWidth;
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;
  return " ".repeat(leftPadding) + text + " ".repeat(rightPadding);
}
function rightAlignText(text, width) {
  const textWidth = measureText(text);
  if (textWidth >= width) {
    return text;
  }
  return " ".repeat(width - textWidth) + text;
}
export {
  wrapTextAccurate,
  truncateText,
  stripANSI,
  rightAlignText,
  measureText,
  getStringWidth,
  centerText
};
