"use client";

export default function TerminalUI() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-black text-green-400">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          🖥️ Hello from TerminalUI!
        </h1>
        <p className="text-green-300">
          This is where your terminal will appear
        </p>
      </div>
    </div>
  );
}
