"use client";

import React from "react";

interface CustomTabsProps {
  activeTab: "code-editor" | "web-preview";
  onTabChange: (tab: "code-editor" | "web-preview") => void;
}

const CustomTabs: React.FC<CustomTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex bg-background w-full">
      <div className="flex rounded-full border border-border px-1 py-0.5 relative m-2">
        {/* Sliding indicator */}
        <div
          className={`absolute top-0.5 bottom-0.5 bg-primary/10 border border-primary/20 rounded-full transition-all duration-300 ease-in-out ${
            activeTab === "code-editor"
              ? "left-0.5 w-[calc(50%-0.125rem)]"
              : "left-[calc(50%+0.125rem)] w-[calc(50%-0.125rem)]"
          }`}
        />

        <button
          onClick={() => onTabChange("code-editor")}
          className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out flex items-center gap-2 rounded-full z-10 ${
            activeTab === "code-editor"
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          Code Editor
        </button>
        <button
          onClick={() => onTabChange("web-preview")}
          className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out flex items-center gap-2 rounded-full z-10 ${
            activeTab === "web-preview"
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M22 12h-4l-3 9L9 3l-3 9H2"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2v20"
            />
          </svg>
          Web Preview
        </button>
      </div>
    </div>
  );
};

export default CustomTabs;
