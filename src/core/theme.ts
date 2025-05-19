// Type for color values (string or null for terminal default)
export type Color = string | null;

// Main theme interface
export interface Theme {
  name: string;
  description: string;
  author: string;
  version: string;
  
  colors: {
    // Base colors
    primary: Color;
    secondary: Color;
    background: Color;
    foreground: Color;
    
    // Status colors
    success: Color;
    warning: Color;
    error: Color;
    info: Color;
  };
  
  // Derived colors (calculated from base colors, but can be overridden)
  derived?: {
    surfaceColor?: Color;
    mutedText?: Color;
  };
  
  // Component-specific styling
  components?: {
    box?: {
      background?: Color;
      foreground?: Color;
      border?: {
        color?: Color;
        focusColor?: Color;
      };
    };
    text?: {
      normal?: Color;
      muted?: Color;
      bold?: {
        color?: Color;
      };
    };
    list?: {
      background?: Color;
      item?: {
        normal?: Color;
        selected?: {
          background?: Color;
          foreground?: Color;
        };
        hover?: {
          background?: Color;
        };
      };
    };
    input?: {
      background?: Color;
      foreground?: Color;
      placeholder?: Color;
      border?: {
        color?: Color;
        focusColor?: Color;
      };
    };
  };
}

// Default theme - uses terminal colors
export const TerminalTheme: Theme = {
  name: "Terminal",
  description: "Uses the terminal's default colors",
  author: "RLabs Inc.",
  version: "1.0.0",
  
  colors: {
    // Basic colors - use terminal defaults
    primary: "blue",
    secondary: "cyan",
    background: null,     // null = use terminal default
    foreground: null,     // null = use terminal default
    
    // Status colors
    success: "green",
    warning: "yellow",
    error: "red",
    info: "blue",
  }
};

// Dark theme - for users who want a specific look
export const DarkTheme: Theme = {
  name: "Dark",
  description: "A dark theme with good contrast",
  author: "RLabs Inc.",
  version: "1.0.0",
  
  colors: {
    primary: "#4a7fff",
    secondary: "#00ccbb",
    background: "#121212",
    foreground: "#ffffff",
    
    success: "#00cc66",
    warning: "#ffcc00",
    error: "#ff4d4d",
    info: "#66ccff",
  },
  
  derived: {
    surfaceColor: "#1e1e1e",
    mutedText: "#aaaaaa",
  },
  
  components: {
    box: {
      border: {
        color: "#4a7fff",
        focusColor: "#00ccbb",
      }
    },
    list: {
      item: {
        selected: {
          background: "#4a7fff",
          foreground: "#ffffff",
        },
        hover: {
          background: "#2a2a2a",
        }
      }
    },
    input: {
      placeholder: "#777777",
      border: {
        focusColor: "#00ccbb",
      }
    }
  }
};

// Light theme - for users who prefer light backgrounds
export const LightTheme: Theme = {
  name: "Light",
  description: "A light theme with good contrast",
  author: "RLabs Inc.",
  version: "1.0.0",
  
  colors: {
    primary: "#0066cc",
    secondary: "#009988",
    background: "#f5f5f5",
    foreground: "#333333",
    
    success: "#00aa44",
    warning: "#dd9900",
    error: "#cc3333",
    info: "#0088cc",
  },
  
  derived: {
    surfaceColor: "#ffffff",
    mutedText: "#777777",
  },
  
  components: {
    box: {
      border: {
        color: "#0066cc",
        focusColor: "#009988",
      }
    },
    list: {
      item: {
        selected: {
          background: "#0066cc",
          foreground: "#ffffff",
        },
        hover: {
          background: "#e5e5e5",
        }
      }
    },
    input: {
      placeholder: "#aaaaaa",
      border: {
        focusColor: "#009988",
      }
    }
  }
};