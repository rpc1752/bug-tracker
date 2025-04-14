import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const variants = {
  success: {
    icon: CheckCircleIcon,
    classes: "bg-green-50 text-green-800 border-green-200",
    iconClass: "text-green-400",
  },
  error: {
    icon: XCircleIcon,
    classes: "bg-red-50 text-red-800 border-red-200",
    iconClass: "text-red-400",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    classes: "bg-yellow-50 text-yellow-800 border-yellow-200",
    iconClass: "text-yellow-400",
  },
  info: {
    icon: InformationCircleIcon,
    classes: "bg-blue-50 text-blue-800 border-blue-200",
    iconClass: "text-blue-400",
  },
};

export default function Alert({
  title,
  message,
  variant = "info",
  className = "",
  onClose,
  actions = null,
}) {
  const { icon: Icon, classes, iconClass } = variants[variant] || variants.info;

  return (
    <div className={`rounded-lg border p-4 ${classes} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {message && <div className="text-sm mt-1">{message}</div>}
          {actions && <div className="mt-4">{actions}</div>}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  variant === "error"
                    ? "bg-red-100 text-red-500 hover:bg-red-200 focus:ring-red-600 focus:ring-offset-red-50"
                    : variant === "success"
                    ? "bg-green-100 text-green-500 hover:bg-green-200 focus:ring-green-600 focus:ring-offset-green-50"
                    : variant === "warning"
                    ? "bg-yellow-100 text-yellow-500 hover:bg-yellow-200 focus:ring-yellow-600 focus:ring-offset-yellow-50"
                    : "bg-blue-100 text-blue-500 hover:bg-blue-200 focus:ring-blue-600 focus:ring-offset-blue-50"
                }`}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
