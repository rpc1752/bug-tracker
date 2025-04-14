import React from "react";
import Button from "./Button";

export default function EmptyState({
  title = "No items found",
  description = "There are no items to display at this time.",
  icon: Icon,
  buttonText,
  buttonIcon,
  buttonAction,
  buttonTo,
  buttonVariant = "primary",
  image,
  className = "",
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-${
        compact ? "6" : "12"
      } px-4 text-center ${className}`}
    >
      {image && <div className="mb-4">{image}</div>}

      {Icon && !image && (
        <div
          className={`rounded-full bg-gray-100 p-3 mb-4 inline-flex ${
            compact ? "h-12 w-12" : "h-16 w-16"
          }`}
        >
          <Icon
            className={`text-gray-500 ${
              compact ? "h-6 w-6" : "h-8 w-8"
            } m-auto`}
            aria-hidden="true"
          />
        </div>
      )}

      <h3
        className={`font-medium text-gray-900 ${
          compact ? "text-base" : "text-lg"
        }`}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`mt-1 text-gray-500 max-w-md ${compact ? "text-sm" : ""}`}
        >
          {description}
        </p>
      )}

      {buttonText && (
        <div className="mt-6">
          <Button
            variant={buttonVariant}
            onClick={buttonAction}
            to={buttonTo}
            icon={buttonIcon}
          >
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
}
