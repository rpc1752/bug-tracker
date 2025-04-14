import React from "react";
import { useDarkMode } from "../context/DarkModeContext";

export default function Card({
  children,
  className = "",
  padding = "default",
  hover = false,
  as: Component = "div",
  ...props
}) {
  const { darkMode } = useDarkMode();

  const paddingClasses = {
    none: "",
    small: "p-3",
    default: "p-5",
    large: "p-6",
  };

  const hoverClasses = hover
    ? `transition-all duration-200 hover:translate-y-[-2px] ${
        darkMode ? "hover:shadow-card-hover-dark" : "hover:shadow-card-hover"
      }`
    : "";

  const darkModeClasses = darkMode
    ? "bg-gray-800 border border-gray-700 shadow-md shadow-gray-900/10"
    : "bg-white border border-gray-200 shadow-sm";

  return (
    <Component
      className={`card rounded-lg ${darkModeClasses} ${
        paddingClasses[padding] || paddingClasses.default
      } ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  titleClass = "",
  className = "",
  action,
  children,
}) {
  const { darkMode } = useDarkMode();

  return (
    <div className={`flex justify-between items-start mb-4 ${className}`}>
      <div className="flex items-center">
        {Icon && (
          <div className="mr-3 flex-shrink-0">
            <Icon
              className={`h-6 w-6 ${
                darkMode ? "text-primary-400" : "text-primary-500"
              }`}
            />
          </div>
        )}
        <div>
          {title && (
            <h3
              className={`text-lg font-medium ${
                darkMode ? "text-white" : "text-gray-900"
              } ${titleClass}`}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-500"
              } mt-1`}
            >
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  const { darkMode } = useDarkMode();

  return (
    <div
      className={`mt-4 pt-4 border-t ${
        darkMode ? "border-gray-700" : "border-gray-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}
