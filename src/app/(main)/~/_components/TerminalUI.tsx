"use client";

import { useSingleStack } from "@/context/SingleStackProvider";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

// Helper function to get CSS variable value and convert oklch to hex
function getCSSVariableValue(variableName: string): string {
  if (typeof window === "undefined") return "#000000";

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  // If it's already a hex color, return it
  if (value.startsWith("#")) {
    return value;
  }

  // For oklch colors, we need to convert them
  // Since oklch conversion is complex, we'll use a temporary element
  const tempEl = document.createElement("div");
  tempEl.style.color = value;
  document.body.appendChild(tempEl);
  const rgb = getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);

  // Convert rgb(r, g, b) to hex
  const match = rgb.match(/\d+/g);
  if (match && match.length >= 3) {
    const r = parseInt(match[0]).toString(16).padStart(2, "0");
    const g = parseInt(match[1]).toString(16).padStart(2, "0");
    const b = parseInt(match[2]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  return "#000000";
}

// Get terminal theme colors based on current theme
function getTerminalTheme(isDark: boolean) {
  if (isDark) {
    return {
      background: "#000000", // Black background for dark theme
      foreground: "#ffffff", // White text for dark theme
      cursor: "#ffffff", // White cursor for dark theme
      cursorAccent: "#000000",
      selection: "#333333",
      black: "#000000",
      red: "#ef4444",
      green: "#22c55e",
      yellow: "#eab308",
      blue: "#3b82f6",
      magenta: "#a855f7",
      cyan: "#06b6d4",
      white: "#ffffff",
      brightBlack: "#525252",
      brightRed: "#f87171",
      brightGreen: "#4ade80",
      brightYellow: "#fbbf24",
      brightBlue: "#60a5fa",
      brightMagenta: "#c084fc",
      brightCyan: "#22d3ee",
      brightWhite: "#f5f5f5",
    };
  } else {
    return {
      background: "#ffffff", // White background for light theme
      foreground: "#000000", // Black text for light theme
      cursor: "#000000", // Black cursor for light theme
      cursorAccent: "#ffffff",
      selection: "#e5e5e5",
      black: "#000000",
      red: "#dc2626",
      green: "#16a34a",
      yellow: "#ca8a04",
      blue: "#2563eb",
      magenta: "#9333ea",
      cyan: "#0891b2",
      white: "#ffffff",
      brightBlack: "#737373",
      brightRed: "#ef4444",
      brightGreen: "#22c55e",
      brightYellow: "#eab308",
      brightBlue: "#3b82f6",
      brightMagenta: "#a855f7",
      brightCyan: "#06b6d4",
      brightWhite: "#fafafa",
    };
  }
}

export default function TerminalUI() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { registerTerminal, unregisterTerminal } = useSingleStack();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!terminalRef.current) return;

    // Determine initial theme - check resolvedTheme first, then fallback to document class
    const initialIsDark =
      resolvedTheme === "dark" ||
      (typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark"));

    const terminal = new Terminal({
      theme: getTerminalTheme(initialIsDark),
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();
    terminalInstanceRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Writer that xterm can use
    const write = (text: string) => {
      terminal.write(text);
    };
    registerTerminal(write);

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch {}
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      unregisterTerminal();
      terminal.dispose();
      terminalInstanceRef.current = null;
      fitAddonRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only create terminal once - registerTerminal/unregisterTerminal are stable functions

  // Update terminal theme when theme changes
  useEffect(() => {
    if (terminalInstanceRef.current && resolvedTheme) {
      const currentIsDark = resolvedTheme === "dark";
      terminalInstanceRef.current.options.theme =
        getTerminalTheme(currentIsDark);
    }
  }, [resolvedTheme]);

  // Refit terminal when it becomes visible again (e.g., after tab switch)
  // Use ResizeObserver to detect when the terminal container size changes
  useEffect(() => {
    if (
      !terminalRef.current ||
      !terminalInstanceRef.current ||
      !fitAddonRef.current
    )
      return;

    const checkAndRefit = () => {
      if (terminalRef.current && fitAddonRef.current) {
        const isVisible = terminalRef.current.offsetParent !== null;
        if (isVisible) {
          // Use requestAnimationFrame to ensure DOM is updated
          requestAnimationFrame(() => {
            try {
              fitAddonRef.current?.fit();
            } catch {
              // Ignore errors
            }
          });
        }
      }
    };

    // Use ResizeObserver to detect when the container becomes visible/resized
    const resizeObserver = new ResizeObserver(() => {
      checkAndRefit();
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    // Also check on window focus and visibility change
    window.addEventListener("focus", checkAndRefit);
    document.addEventListener("visibilitychange", checkAndRefit);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("focus", checkAndRefit);
      document.removeEventListener("visibilitychange", checkAndRefit);
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-background text-foreground px-4 py-2 border-b border-border flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-destructive"></div>
        <div className="w-3 h-3 rounded-full bg-accent"></div>
        <div className="w-3 h-3 rounded-full bg-primary"></div>
        <span className="ml-2 text-sm font-mono">Terminal</span>
      </div>
      <div ref={terminalRef} className="flex-1" />
    </div>
  );
}
