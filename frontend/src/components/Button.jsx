import React from "react";

export default function Button({
  children,
  variant = "primary", // primary, secondary, outline, danger, ghost
  size = "md", // sm, md, lg
  icon: Icon,
  iconPosition = "left",
  type = "button",
  disabled = false,
  onClick,
  className = "",
  title,
  ...props
}) {
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 15 : size === "lg" ? 20 : 17} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 15 : size === "lg" ? 20 : 17} />}
    </button>
  );
}
