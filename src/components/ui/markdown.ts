/**
 * Markdown parser for terminal rendering
 * Converts markdown to blessed-compatible tagged strings
 */

import type { Theme } from './theme';

export interface MarkdownToken {
  type: 'text' | 'bold' | 'italic' | 'code' | 'codeblock' | 'link' | 
        'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6' |
        'quote' | 'list' | 'linebreak';
  content: string;
  url?: string; // for links
}

/**
 * Parse markdown text into tokens
 */
export function parseMarkdown(text: string): MarkdownToken[] {
  const tokens: MarkdownToken[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Code blocks
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++; // Skip the opening ```
      
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      if (codeLines.length > 0) {
        tokens.push({
          type: 'codeblock',
          content: codeLines.join('\n')
        });
      }
      continue;
    }
    
    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      tokens.push({
        type: `heading${level}` as MarkdownToken['type'],
        content: headingMatch[2]
      });
      if (i < lines.length - 1) {
        tokens.push({ type: 'linebreak', content: '\n' });
      }
      continue;
    }
    
    // Blockquotes
    if (line.startsWith('> ')) {
      tokens.push({
        type: 'quote',
        content: line.substring(2)
      });
      if (i < lines.length - 1) {
        tokens.push({ type: 'linebreak', content: '\n' });
      }
      continue;
    }
    
    // Lists
    if (line.match(/^[\s]*[-*]\s+/)) {
      const listMatch = line.match(/^([\s]*)([-*])\s+(.+)$/);
      if (listMatch) {
        const indent = listMatch[1].length;
        const content = listMatch[3];
        tokens.push({
          type: 'list',
          content: ' '.repeat(indent) + '• ' + content
        });
        if (i < lines.length - 1) {
          tokens.push({ type: 'linebreak', content: '\n' });
        }
        continue;
      }
    }
    
    // Inline parsing
    parseInline(line, tokens);
    
    if (i < lines.length - 1) {
      tokens.push({ type: 'linebreak', content: '\n' });
    }
  }
  
  return tokens;
}

/**
 * Parse inline markdown elements
 */
function parseInline(text: string, tokens: MarkdownToken[]) {
  let remaining = text;
  
  while (remaining.length > 0) {
    // Bold (**text** or __text__)
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
    if (boldMatch) {
      const before = remaining.substring(0, boldMatch.index || 0);
      if (before) {
        parseInlineWithoutBold(before, tokens);
      }
      tokens.push({
        type: 'bold',
        content: boldMatch[2]
      });
      remaining = remaining.substring((boldMatch.index || 0) + boldMatch[0].length);
      continue;
    }
    
    // No more special elements, parse the rest
    parseInlineWithoutBold(remaining, tokens);
    break;
  }
}

/**
 * Parse inline elements except bold (to avoid recursion)
 */
function parseInlineWithoutBold(text: string, tokens: MarkdownToken[]) {
  let remaining = text;
  
  while (remaining.length > 0) {
    // Italic (*text* or _text_)
    const italicMatch = remaining.match(/^(\*|_)([^*_]+?)\1/);
    if (italicMatch) {
      const before = remaining.substring(0, italicMatch.index || 0);
      if (before) {
        parseInlineWithoutItalic(before, tokens);
      }
      tokens.push({
        type: 'italic',
        content: italicMatch[2]
      });
      remaining = remaining.substring((italicMatch.index || 0) + italicMatch[0].length);
      continue;
    }
    
    // No more italic, parse the rest
    parseInlineWithoutItalic(remaining, tokens);
    break;
  }
}

/**
 * Parse inline elements except italic
 */
function parseInlineWithoutItalic(text: string, tokens: MarkdownToken[]) {
  let remaining = text;
  
  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      const before = remaining.substring(0, codeMatch.index || 0);
      if (before) {
        parseInlineWithoutCode(before, tokens);
      }
      tokens.push({
        type: 'code',
        content: codeMatch[1]
      });
      remaining = remaining.substring((codeMatch.index || 0) + codeMatch[0].length);
      continue;
    }
    
    // No more code, parse the rest
    parseInlineWithoutCode(remaining, tokens);
    break;
  }
}

/**
 * Parse inline elements except code
 */
function parseInlineWithoutCode(text: string, tokens: MarkdownToken[]) {
  let remaining = text;
  
  while (remaining.length > 0) {
    // Links [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const before = remaining.substring(0, linkMatch.index || 0);
      if (before) {
        tokens.push({
          type: 'text',
          content: before
        });
      }
      tokens.push({
        type: 'link',
        content: linkMatch[1],
        url: linkMatch[2]
      });
      remaining = remaining.substring((linkMatch.index || 0) + linkMatch[0].length);
      continue;
    }
    
    // No more special elements, add as text
    if (remaining) {
      tokens.push({
        type: 'text',
        content: remaining
      });
    }
    break;
  }
}

/**
 * Convert markdown tokens to blessed-compatible tagged string
 */
export function tokensToTaggedString(tokens: MarkdownToken[], theme: Theme, mode: 'subtle' | 'full'): string {
  let result = '';
  
  for (const token of tokens) {
    if (mode === 'subtle') {
      // In subtle mode, preserve structure but use base text color
      switch (token.type) {
        case 'bold':
          result += `{bold}${token.content}{/bold}`;
          break;
        case 'italic':
          result += `{italic}${token.content}{/italic}`;
          break;
        case 'code':
          result += `\`${token.content}\``;
          break;
        case 'codeblock':
          result += `\n${token.content}\n`;
          break;
        case 'heading1':
        case 'heading2':
        case 'heading3':
        case 'heading4':
        case 'heading5':
        case 'heading6':
          result += `{bold}${token.content}{/bold}`;
          break;
        case 'quote':
          result += `  │ ${token.content}`;
          break;
        case 'list':
          result += token.content;
          break;
        case 'link':
          result += `${token.content} (${token.url})`;
          break;
        case 'linebreak':
          result += token.content;
          break;
        default:
          result += token.content;
      }
    } else {
      // Full mode with colors
      switch (token.type) {
        case 'bold':
          result += `{${theme.colors.strong}-fg}{bold}${token.content}{/bold}{/${theme.colors.strong}-fg}`;
          break;
        case 'italic':
          result += `{${theme.colors.emphasis}-fg}{italic}${token.content}{/italic}{/${theme.colors.emphasis}-fg}`;
          break;
        case 'code':
          result += `{${theme.colors.code}-fg}\`${token.content}\`{/${theme.colors.code}-fg}`;
          break;
        case 'codeblock':
          const codeLines = token.content.split('\n').map(line => 
            `{${theme.colors.codeBlock}-fg}  ${line}{/${theme.colors.codeBlock}-fg}`
          ).join('\n');
          result += `\n${codeLines}\n`;
          break;
        case 'heading1':
        case 'heading2':
        case 'heading3':
        case 'heading4':
        case 'heading5':
        case 'heading6':
          const headingColor = theme.colors[token.type as keyof typeof theme.colors];
          result += `{${headingColor}-fg}{bold}${token.content}{/bold}{/${headingColor}-fg}`;
          break;
        case 'quote':
          result += `{${theme.colors.quote}-fg}  │ ${token.content}{/${theme.colors.quote}-fg}`;
          break;
        case 'list':
          result += `{${theme.colors.list}-fg}${token.content}{/${theme.colors.list}-fg}`;
          break;
        case 'link':
          result += `{${theme.colors.link}-fg}{underline}${token.content}{/underline}{/${theme.colors.link}-fg}`;
          break;
        case 'linebreak':
          result += token.content;
          break;
        default:
          result += `{${theme.colors.text}-fg}${token.content}{/${theme.colors.text}-fg}`;
      }
    }
  }
  
  return result;
}

/**
 * Convert markdown to blessed-compatible tagged string
 */
export function markdownToTaggedString(text: string, theme: Theme, mode: 'subtle' | 'full' = 'full'): string {
  const tokens = parseMarkdown(text);
  return tokensToTaggedString(tokens, theme, mode);
}