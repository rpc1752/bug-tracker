import React from "react";
import { Link } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import LoadingSpinner from "./LoadingSpinner";

const getVariantClasses = (variant, isDarkMode) => {
  const variants = {
    primary: isDarkMode
      ? "btn bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm shadow-primary-900/30"
      : "btn bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
    secondary: isDarkMode
      ? "btn bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-300"
      : "btn bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-300",
    success: isDarkMode
      ? "btn bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-sm shadow-green-900/30"
      : "btn bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    danger: isDarkMode
      ? "btn bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm shadow-red-900/30"
      : "btn bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    outline: isDarkMode
      ? "btn border border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 focus:ring-gray-500"
      : "btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost: isDarkMode
      ? "btn bg-transparent text-gray-200 hover:bg-gray-700 focus:ring-gray-500"
      : "btn bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    link: isDarkMode
      ? "text-primary-400 hover:text-primary-300 font-medium underline-offset-2 hover:underline"
      : "text-primary-600 hover:text-primary-700 font-medium underline-offset-2 hover:underline",
  };

  return variants[variant] || variants.primary;
};

const sizes = {
  xs: "px-2 py-1 text-xs",
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  isLoading = false,
  icon: Icon = null,
  iconPosition = "left",
  href,
  to,
  type = "button",
  onClick,
  fullWidth = false,
  ...props
}) {
  const { darkMode } = useDarkMode();
  const baseClasses = variant === "link" ? "" : "btn";
  const variantClasses = getVariantClasses(variant, darkMode);
  const sizeClasses = sizes[size] || "";
  const widthClass = fullWidth ? "w-full" : "";

  const allClasses = `${variant === "link" ? variantClasses : baseClasses} ${
    variantClasses !== baseClasses ? variantClasses : ""
  } ${sizeClasses} ${widthClass} ${
    disabled && darkMode ? "opacity-50 cursor-not-allowed" : ""
  } ${className}`;

  const getIconColorClass = () => {
    if (
      variant === "primary" ||
      variant === "success" ||
      variant === "danger"
    ) {
      return "text-white";
    }
    if (
      (darkMode && variant === "outline") ||
      (darkMode && variant === "ghost")
    ) {
      return "text-gray-200";
    }
    if (darkMode && variant === "link") {
      return "text-primary-400";
    }
    return variant === "link" ? "text-primary-600" : "text-current";
  };

  const content = (
    <>
      {isLoading && (
        <LoadingSpinner
          size="sm"
          variant={
            variant === "primary" ||
            variant === "success" ||
            variant === "danger"
              ? "white"
              : darkMode
              ? "light"
              : "primary"
          }
          className="mr-2"
        />
      )}
      {Icon && iconPosition === "left" && !isLoading && (
        <Icon
          className={`h-5 w-5 ${getIconColorClass()} ${children ? "mr-2" : ""}`}
          aria-hidden="true"
        />
      )}
      {children}
      {Icon && iconPosition === "right" && !isLoading && (
        <Icon
          className={`h-5 w-5 ${getIconColorClass()} ${children ? "ml-2" : ""}`}
          aria-hidden="true"
        />
      )}
    </>
  );

  // Render as Link from react-router if "to" prop is provided
  if (to) {
    return (
      <Link to={to} className={allClasses} {...props}>
        {content}
      </Link>
    );
  }

  // Render as anchor tag if href is provided
  if (href) {
    return (
      <a href={href} className={allClasses} {...props}>
        {content}
      </a>
    );
  }

  // Default to button
  return (
    <button
      type={type}
      className={allClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
}
