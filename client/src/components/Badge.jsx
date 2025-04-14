import React from "react";

const variants = {
  primary: "bg-primary-100 text-primary-800",
  secondary: "bg-secondary-100 text-secondary-800",
  success: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-100 text-blue-800",
  purple: "bg-purple-100 text-purple-800",
  gray: "bg-gray-100 text-gray-800",
};

const sizes = {
  xs: "text-xs px-1.5 py-0.5 rounded",
  sm: "text-xs px-2 py-1 rounded",
  md: "text-sm px-2.5 py-1 rounded-md",
  lg: "text-sm px-3 py-1.5 rounded-md",
};

export default function Badge({
  children,
  variant = "primary",
  size = "sm",
  className = "",
  dot = false,
  icon: Icon = null,
}) {
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.sm;

  return (
    <span
      className={`inline-flex items-center font-medium ${variantClasses} ${sizeClasses} ${className}`}
    >
      {dot && (
        <span
          className={`mr-1.5 inline-block h-2 w-2 flex-shrink-0 rounded-full ${
            variant === "primary"
              ? "bg-primary-400"
              : variant === "secondary"
              ? "bg-secondary-400"
              : variant === "success"
              ? "bg-green-400"
              : variant === "danger"
              ? "bg-red-400"
              : variant === "warning"
              ? "bg-yellow-400"
              : variant === "info"
              ? "bg-blue-400"
              : variant === "purple"
              ? "bg-purple-400"
              : "bg-gray-400"
          }`}
        />
      )}
      {Icon && <Icon className="mr-1.5 h-4 w-4 flex-shrink-0" />}
      {children}
    </span>
  );
}
