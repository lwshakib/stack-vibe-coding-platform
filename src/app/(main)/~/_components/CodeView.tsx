import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSingleStack } from "@/context/SingleStackProvider";
import { Editor } from "@monaco-editor/react";
import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";

interface CodeEditorProps {
  filename?: string;
}

interface FileHeaderProps {
  file: any;
  onCopy: () => void;
  copied: boolean;
}

function FileHeader({ file, onCopy, copied }: FileHeaderProps) {
  const getFileType = (filePath: string) => {
    if (filePath.endsWith(".tsx")) return "TSX";
    if (filePath.endsWith(".ts")) return "TS";
    if (filePath.endsWith(".js")) return "JS";
    if (filePath.endsWith(".jsx")) return "JSX";
    if (filePath.endsWith(".md")) return "MD";
    if (filePath.endsWith(".css")) return "CSS";
    if (filePath.endsWith(".json")) return "JSON";
    return "TXT";
  };

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b">
      <div className="flex items-center gap-2 min-w-0">
        <Badge variant="outline" className="text-xs">
          {getFileType(file.id ?? file.label)}
        </Badge>
        <span
          className="text-xs text-muted-foreground truncate"
          title={file.id ?? file.label}
        >
          {file.id ?? file.label}
        </span>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="cursor-pointer h-8 w-8 p-0"
          title="Copy file content"
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default function CodeView({
  filename = "untitled.js",
}: CodeEditorProps) {
  const [copied, setCopied] = React.useState(false);
  const { resolvedTheme } = useTheme();
  const { selectedFile } = useSingleStack();

  const handleCopy = () => {
    const textToCopy = selectedFile?.data?.contents ?? "";
    const doSet = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(doSet)
        .catch(() => {
          try {
            const textarea = document.createElement("textarea");
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            doSet();
          } catch {
            // ignore
          }
        });
    } else {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        doSet();
      } catch {
        // ignore
      }
    }
  };

  // Debounced editor change handler
  const changeDebounceRef = React.useRef<number | undefined>(undefined);
  const handleEditorChange = (value?: string) => {
    if (changeDebounceRef.current) {
      window.clearTimeout(changeDebounceRef.current);
    }
    changeDebounceRef.current = window.setTimeout(() => {}, 1000);
  };

  if (!selectedFile) {
    return null;
  }

  const CodeEditorSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Define custom themes with pure black/white backgrounds
    monaco.editor.defineTheme("pure-black", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#000000",
        "editor.foreground": "#ffffff",
        "editor.lineHighlightBackground": "#000000",
        "editorLineNumber.foreground": "#ffffff",
        "editorLineNumber.activeForeground": "#ffffff",
        "editor.selectionBackground": "#404040",
        "editor.inactiveSelectionBackground": "#404040",
      },
    });

    monaco.editor.defineTheme("pure-white", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#000000",
        "editor.lineHighlightBackground": "#ffffff",
        "editorLineNumber.foreground": "#000000",
        "editorLineNumber.activeForeground": "#000000",
        "editor.selectionBackground": "#add6ff",
        "editor.inactiveSelectionBackground": "#add6ff",
      },
    });

    // Set the theme based on current resolved theme
    monaco.editor.setTheme(
      resolvedTheme === "dark" ? "pure-black" : "pure-white"
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* File Header */}
      <FileHeader file={selectedFile} onCopy={handleCopy} copied={copied} />

      <div className="flex-1">
        <Editor
          loading={<CodeEditorSkeleton />}
          language={
            selectedFile?.id?.endsWith(".tsx")
              ? "typescript"
              : selectedFile?.id?.endsWith(".ts")
              ? "typescript"
              : selectedFile?.id?.endsWith(".js")
              ? "javascript"
              : selectedFile?.id?.endsWith(".jsx")
              ? "javascript"
              : selectedFile?.id?.endsWith(".md")
              ? "markdown"
              : selectedFile?.id?.endsWith(".css")
              ? "css"
              : selectedFile?.id?.endsWith(".json")
              ? "json"
              : "text"
          }
          value={selectedFile?.data?.contents || ""}
          theme={resolvedTheme === "dark" ? "pure-black" : "pure-white"}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 12, // Smaller font on mobile
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on", // Enable word wrap on mobile
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
            },
          }}
        />
      </div>
    </div>
  );
}
