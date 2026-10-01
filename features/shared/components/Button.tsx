import React from "react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  url?: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  openInNewTab?: boolean;
  ariaLabel?: string;
  variant?: "primary" | "secondary" | "solid";
  solidColor?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  url,
  onClick,
  className = "",
  icon,
  iconClassName = "",
  iconPosition = "left",
  disabled = false,
  type = "button",
  openInNewTab = false,
  ariaLabel,
  variant = "primary",
  solidColor,
}) => {
  const baseClasses =
    "px-1 py-2 rounded-full font-medium inline-flex items-center gap-2 text-white transition-all duration-300";

  const variantClass =
    variant === "primary"
      ? "gradient-primary"
      : variant === "secondary"
      ? "gradient-secondary"
      : "";

  const combinedClassName = [
    baseClasses,
    variantClass,
    className,
    disabled && "opacity-50 cursor-not-allowed block px-2 ",
  ]
    .filter(Boolean)
    .join(" ");

  const inlineStyle =
    variant === "solid" && solidColor
      ? { background: solidColor }
      : undefined;

  const renderIcon = () => {
    if (!icon) return null;
    return <span className={iconClassName}>{icon}</span>;
  };

  const renderContent = () => (
    <>
      {icon && iconPosition === "left" && renderIcon()}
      <span>{children}</span>
      {icon && iconPosition === "right" && renderIcon()}
    </>
  );

  if (url && !disabled) {
    return (
      <Link prefetch={false}
        href={url}
        className={`relative px-4 ${combinedClassName}`}
        onClick={onClick}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        style={inlineStyle}
      >
            {renderContent()}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 ${combinedClassName}`}
      aria-label={ariaLabel}
      style={inlineStyle}
    >
      {renderContent()}
    </button>
  );
};

export default Button; 