import React from "react";
import "./TabBar.css";

export function TabBar({ tabs, activeTab, onTabChange, className = "" }) {
  return (
    <div className={`sys-tabs ${className}`}>
      {tabs.filter(t => !t.hidden).map((tab) => (
        <button
          key={tab.key}
          className={`sys-tab ${activeTab === tab.key ? "active" : ""}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
