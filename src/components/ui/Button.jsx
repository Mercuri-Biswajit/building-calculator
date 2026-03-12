import React from "react";
import "./Button.css";

export function Button({
  children,
  variant = "primary", // primary, secondary, danger, reset
  onClick,
  disabled = false,
  className = "",
  type = "button",
  icon = null,
  style = {},
}) {
  const baseClass = "sys-btn";
  const variantClass = `sys-btn-${variant}`;
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
