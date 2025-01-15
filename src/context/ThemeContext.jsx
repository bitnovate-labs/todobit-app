import { createContext, useContext, useEffect, useState } from "react";
import { theme } from "antd";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Update theme-related meta tags dynamically
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const statusBarMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    );

    if (isDarkMode) {
      themeColorMeta?.setAttribute("content", "#141414"); // Dark mode background
      statusBarMeta?.setAttribute("content", "#141414"); // Overlay effect
    } else {
      themeColorMeta?.setAttribute("content", "#ffffff"); // Light mode background
      statusBarMeta?.setAttribute("content", "default");
    }

    // Force Safari to update by replacing the meta tag safely
    setTimeout(() => {
      if (themeColorMeta) {
        themeColorMeta.remove(); // Safe removal check
      }
      const newMetaTag = document.createElement("meta");
      newMetaTag.name = "theme-color";
      newMetaTag.content = isDarkMode ? "#000000" : "#ffffff";
      document.head.appendChild(newMetaTag); // Safely add new meta tag
    }, 100);
  }, [isDarkMode]);

  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#1677ff",
    },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
