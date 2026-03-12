import React from "react";
import "./PageHeader.css";

export function PageHeader({ title, icon, description, align = "left", className = "" }) {
  return (
    <div className={`sys-page-header sys-align-${align} ${className}`}>
      <h2 className="sys-page-title">
        {icon && <span className="sys-page-icon">{icon}</span>}
        {title}
      </h2>
      {description && <p className="sys-page-desc">{description}</p>}
    </div>
  );
}
