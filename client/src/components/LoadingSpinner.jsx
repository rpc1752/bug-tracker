import React from "react";
import { useDarkMode } from "../context/DarkModeContext";

const sizes = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const getVariants = (isDarkMode) => ({
  primary: isDarkMode ? "text-primary-400" : "text-primary-500",
  white: "text-white",
  gray: isDarkMode ? "text-gray-400" : "text-gray-500",
  light: "text-gray-200",
});

export default function LoadingSpinner({
  size = "md",
  variant = "primary",
  className = "",
  text = "",
  fullScreen = false,
}) {
  const { darkMode } = useDarkMode();
  const variants = getVariants(darkMode);

  const containerClasses = fullScreen
    ? `fixed inset-0 flex items-center justify-center ${
        darkMode ? "bg-gray-900 bg-opacity-80" : "bg-white bg-opacity-80"
      } z-50`
    : "flex items-center justify-center";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        <svg
          className={`animate-spin ${sizes[size]} ${variants[variant]} ${className}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {text && (
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>{text}</p>
        )}
      </div>
    </div>
  );
}
