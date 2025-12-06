// @bun
// src/utils/text-wrap.ts
import { measureText, getStringWidth } from './bun-text.mjs';
function wrapText(text, width) {
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
    const words = paragraph.split(" ");
    for (let i = 0;i < words.length; i++) {
      const word = words[i];
      const wordWidth = measureText(word);
      if (wordWidth > width) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
        }
        let wordPart = "";
        let partWidth = 0;
        for (const char of word) {
          const charWidth = getStringWidth(char);
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
      const separator = currentLine ? " " : "";
      const testLine = currentLine + separator + word;
      const testWidth = measureText(testLine);
      if (testWidth <= width) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  return lines;
}
export {
  wrapText,
  measureText
};
