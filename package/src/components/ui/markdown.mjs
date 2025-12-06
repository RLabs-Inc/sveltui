// @bun
// src/components/ui/markdown.ts
function parseMarkdown(text) {
  const tokens = [];
  const lines = text.split(`
`);
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (codeLines.length > 0) {
        tokens.push({
          type: "codeblock",
          content: codeLines.join(`
`)
        });
      }
      continue;
    }
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      tokens.push({
        type: `heading${level}`,
        content: headingMatch[2]
      });
      if (i < lines.length - 1) {
        tokens.push({ type: "linebreak", content: `
` });
      }
      continue;
    }
    if (line.startsWith("> ")) {
      tokens.push({
        type: "quote",
        content: line.substring(2)
      });
      if (i < lines.length - 1) {
        tokens.push({ type: "linebreak", content: `
` });
      }
      continue;
    }
    if (line.match(/^[\s]*[-*]\s+/)) {
      const listMatch = line.match(/^([\s]*)([-*])\s+(.+)$/);
      if (listMatch) {
        const indent = listMatch[1].length;
        const content = listMatch[3];
        tokens.push({
          type: "list",
          content: " ".repeat(indent) + "\u2022 " + content
        });
        if (i < lines.length - 1) {
          tokens.push({ type: "linebreak", content: `
` });
        }
        continue;
      }
    }
    parseInline(line, tokens);
    if (i < lines.length - 1) {
      tokens.push({ type: "linebreak", content: `
` });
    }
  }
  return tokens;
}
function parseInline(text, tokens) {
  let remaining = text;
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
    if (boldMatch) {
      const before = remaining.substring(0, boldMatch.index || 0);
      if (before) {
        parseInlineWithoutBold(before, tokens);
      }
      tokens.push({
        type: "bold",
        content: boldMatch[2]
      });
      remaining = remaining.substring((boldMatch.index || 0) + boldMatch[0].length);
      continue;
    }
    parseInlineWithoutBold(remaining, tokens);
    break;
  }
}
function parseInlineWithoutBold(text, tokens) {
  let remaining = text;
  while (remaining.length > 0) {
    const italicMatch = remaining.match(/^(\*|_)([^*_]+?)\1/);
    if (italicMatch) {
      const before = remaining.substring(0, italicMatch.index || 0);
      if (before) {
        parseInlineWithoutItalic(before, tokens);
      }
      tokens.push({
        type: "italic",
        content: italicMatch[2]
      });
      remaining = remaining.substring((italicMatch.index || 0) + italicMatch[0].length);
      continue;
    }
    parseInlineWithoutItalic(remaining, tokens);
    break;
  }
}
function parseInlineWithoutItalic(text, tokens) {
  let remaining = text;
  while (remaining.length > 0) {
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      const before = remaining.substring(0, codeMatch.index || 0);
      if (before) {
        parseInlineWithoutCode(before, tokens);
      }
      tokens.push({
        type: "code",
        content: codeMatch[1]
      });
      remaining = remaining.substring((codeMatch.index || 0) + codeMatch[0].length);
      continue;
    }
    parseInlineWithoutCode(remaining, tokens);
    break;
  }
}
function parseInlineWithoutCode(text, tokens) {
  let remaining = text;
  while (remaining.length > 0) {
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const before = remaining.substring(0, linkMatch.index || 0);
      if (before) {
        tokens.push({
          type: "text",
          content: before
        });
      }
      tokens.push({
        type: "link",
        content: linkMatch[1],
        url: linkMatch[2]
      });
      remaining = remaining.substring((linkMatch.index || 0) + linkMatch[0].length);
      continue;
    }
    if (remaining) {
      tokens.push({
        type: "text",
        content: remaining
      });
    }
    break;
  }
}
function tokensToTaggedString(tokens, theme, mode) {
  let result = "";
  for (const token of tokens) {
    if (mode === "subtle") {
      switch (token.type) {
        case "bold":
          result += `{bold}${token.content}{/bold}`;
          break;
        case "italic":
          result += `{italic}${token.content}{/italic}`;
          break;
        case "code":
          result += `\`${token.content}\``;
          break;
        case "codeblock":
          result += `
${token.content}
`;
          break;
        case "heading1":
        case "heading2":
        case "heading3":
        case "heading4":
        case "heading5":
        case "heading6":
          result += `{bold}${token.content}{/bold}`;
          break;
        case "quote":
          result += `  \u2502 ${token.content}`;
          break;
        case "list":
          result += token.content;
          break;
        case "link":
          result += `${token.content} (${token.url})`;
          break;
        case "linebreak":
          result += token.content;
          break;
        default:
          result += token.content;
      }
    } else {
      switch (token.type) {
        case "bold":
          result += `{${theme.colors.strong}-fg}{bold}${token.content}{/bold}{/${theme.colors.strong}-fg}`;
          break;
        case "italic":
          result += `{${theme.colors.emphasis}-fg}{italic}${token.content}{/italic}{/${theme.colors.emphasis}-fg}`;
          break;
        case "code":
          result += `{${theme.colors.code}-fg}\`${token.content}\`{/${theme.colors.code}-fg}`;
          break;
        case "codeblock":
          const codeLines = token.content.split(`
`).map((line) => `{${theme.colors.codeBlock}-fg}  ${line}{/${theme.colors.codeBlock}-fg}`).join(`
`);
          result += `
${codeLines}
`;
          break;
        case "heading1":
        case "heading2":
        case "heading3":
        case "heading4":
        case "heading5":
        case "heading6":
          const headingColor = theme.colors[token.type];
          result += `{${headingColor}-fg}{bold}${token.content}{/bold}{/${headingColor}-fg}`;
          break;
        case "quote":
          result += `{${theme.colors.quote}-fg}  \u2502 ${token.content}{/${theme.colors.quote}-fg}`;
          break;
        case "list":
          result += `{${theme.colors.list}-fg}${token.content}{/${theme.colors.list}-fg}`;
          break;
        case "link":
          result += `{${theme.colors.link}-fg}{underline}${token.content}{/underline}{/${theme.colors.link}-fg}`;
          break;
        case "linebreak":
          result += token.content;
          break;
        default:
          result += `{${theme.colors.text}-fg}${token.content}{/${theme.colors.text}-fg}`;
      }
    }
  }
  return result;
}
function markdownToTaggedString(text, theme, mode = "full") {
  const tokens = parseMarkdown(text);
  return tokensToTaggedString(tokens, theme, mode);
}
export {
  tokensToTaggedString,
  parseMarkdown,
  markdownToTaggedString
};
