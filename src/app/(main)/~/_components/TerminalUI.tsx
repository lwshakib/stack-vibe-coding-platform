"use client";

import { useSingleStack } from "@/context/SingleStackProvider";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";

export default function TerminalUI() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { registerTerminal, unregisterTerminal } = useSingleStack();
  useEffect(() => {
    if (!terminalRef.current) return;
    const terminal = new Terminal();
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

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
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-background text-white px-4 py-2 border-b border-gray-700 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-2 text-sm font-mono">Terminal</span>
      </div>
      <div ref={terminalRef} className="flex-1" />
    </div>
  );
}
