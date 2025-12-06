// @bun
// src/components/ui/theme.ts
function getDefaultTheme() {
  return {
    name: "default",
    colors: {
      text: "white",
      emphasis: "italic",
      strong: "bold",
      code: "yellow",
      codeBlock: "yellow",
      link: "blue",
      heading1: "bright-white",
      heading2: "bright-white",
      heading3: "white",
      heading4: "white",
      heading5: "gray",
      heading6: "gray",
      quote: "gray",
      list: "white",
      border: "gray"
    }
  };
}
function getClaudeTheme() {
  return {
    name: "claude",
    colors: {
      text: "#E5D5C8",
      emphasis: "#F5A623",
      strong: "#FFFFFF",
      code: "#6FCF97",
      codeBlock: "#6FCF97",
      link: "#56B3E9",
      heading1: "#FFFFFF",
      heading2: "#F5F5F5",
      heading3: "#E5E5E5",
      heading4: "#D5D5D5",
      heading5: "#C5C5C5",
      heading6: "#B5B5B5",
      quote: "#9CA3AF",
      list: "#E5D5C8",
      border: "#6B7280",
      background: "#1A1A1A",
      selection: "#3B82F6"
    }
  };
}
function getMonokaiTheme() {
  return {
    name: "monokai",
    colors: {
      text: "#F8F8F2",
      emphasis: "#FD971F",
      strong: "#F92672",
      code: "#A6E22E",
      codeBlock: "#A6E22E",
      link: "#66D9EF",
      heading1: "#F92672",
      heading2: "#FD971F",
      heading3: "#E6DB74",
      heading4: "#A6E22E",
      heading5: "#66D9EF",
      heading6: "#AE81FF",
      quote: "#75715E",
      list: "#F8F8F2",
      border: "#75715E",
      background: "#272822"
    }
  };
}
function parseThemeFromYAML(yamlContent) {
  const lines = yamlContent.split(`
`);
  const theme = {
    name: "custom",
    colors: {}
  };
  let currentSection = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#"))
      continue;
    if (trimmed === "colors:") {
      currentSection = "colors";
      continue;
    }
    if (trimmed.includes(":")) {
      const [key, value] = trimmed.split(":").map((s) => s.trim());
      if (currentSection === "colors" && theme.colors) {
        theme.colors[key] = value.replace(/['"]/g, "");
      } else if (key === "name") {
        theme.name = value.replace(/['"]/g, "");
      }
    }
  }
  const defaultTheme = getDefaultTheme();
  theme.colors = { ...defaultTheme.colors, ...theme.colors };
  return theme;
}
export {
  parseThemeFromYAML,
  getMonokaiTheme,
  getDefaultTheme,
  getClaudeTheme
};
