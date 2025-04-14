import { createContext, useContext, useState, useEffect } from "react";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      return JSON.parse(savedDarkMode);
    }

    // Otherwise check user's system preference
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    // Apply/remove the dark class to the document body
    if (darkMode) {
      document.documentElement.classList.add("dark");
      // Apply consistent CSS variables for dark mode
      document.documentElement.style.setProperty("--bg-primary", "#111827");
      document.documentElement.style.setProperty("--bg-secondary", "#1F2937");
      document.documentElement.style.setProperty("--bg-tertiary", "#374151");
      document.documentElement.style.setProperty("--text-primary", "#F9FAFB");
      document.documentElement.style.setProperty("--text-secondary", "#E5E7EB");
      document.documentElement.style.setProperty("--text-tertiary", "#9CA3AF");
      document.documentElement.style.setProperty("--border-color", "#374151");
    } else {
      document.documentElement.classList.remove("dark");
      // Reset to light mode CSS variables
      document.documentElement.style.setProperty("--bg-primary", "#FFFFFF");
      document.documentElement.style.setProperty("--bg-secondary", "#F9FAFB");
      document.documentElement.style.setProperty("--bg-tertiary", "#F3F4F6");
      document.documentElement.style.setProperty("--text-primary", "#111827");
      document.documentElement.style.setProperty("--text-secondary", "#4B5563");
      document.documentElement.style.setProperty("--text-tertiary", "#6B7280");
      document.documentElement.style.setProperty("--border-color", "#E5E7EB");
    }
  }, [darkMode]);

  // Listen for system dark mode changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setDarkMode(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
}
