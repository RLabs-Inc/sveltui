// @bun
// src/renderer/text-sync-fix.ts
var textElementContentMap = new WeakMap;
function syncTextContent(happyElement, terminalElement, screen) {
  if (terminalElement.type !== "text" && terminalElement.type !== "ttext") {
    return false;
  }
  let currentContent = "";
  if (happyElement.hasAttribute("content")) {
    currentContent = happyElement.getAttribute("content") || "";
  } else {
    for (const child of happyElement.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        currentContent += child.textContent || "";
      }
    }
    currentContent = currentContent.trim();
  }
  const lastContent = textElementContentMap.get(terminalElement) || "";
  if (currentContent !== lastContent) {
    terminalElement.setProps({
      ...terminalElement.props,
      content: currentContent
    });
    textElementContentMap.set(terminalElement, currentContent);
    if (terminalElement.blessed && screen) {
      screen.render();
    }
    return true;
  }
  return false;
}
function createTextAwareMutationObserver(happyElement, terminalElement, screen, originalCallback) {
  return new MutationObserver((mutations) => {
    let textContentChanged = false;
    for (const mutation of mutations) {
      if (mutation.type === "characterData" || mutation.type === "childList" && terminalElement.type === "text") {
        textContentChanged = syncTextContent(happyElement, terminalElement, screen);
        if (textContentChanged) {
          break;
        }
      }
    }
    if (textContentChanged) {
      return;
    }
    originalCallback(mutations);
  });
}
function clearTextContent(terminalElement) {
  textElementContentMap.delete(terminalElement);
}
export {
  syncTextContent,
  createTextAwareMutationObserver,
  clearTextContent
};
