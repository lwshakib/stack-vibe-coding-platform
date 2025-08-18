"use client";

import { motion } from "framer-motion";
import { Command, Paperclip, Plus, Send, Sparkles } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStack } from "@/context/StackProvider";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { useParams, useRouter } from "next/navigation";
import { useSingleStack } from "@/context/SingleStackProvider";
import { treeToTemplate } from "@/utils/converter";
import { filterIgnoredFiles } from "@/utils/helpers";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 164;

const COMMANDS = [
  {
    title: "Code Review",
    prompt:
      "Please review the following code for best practices, potential bugs, performance issues, security vulnerabilities, and suggest improvements. Include specific recommendations for refactoring and optimization.",
  },
  {
    title: "Debug Code",
    prompt:
      "Help me debug the following code. Identify potential issues, explain what might be causing the problem, and provide solutions with code examples. Include common debugging strategies and tools that could be helpful.",
  },
  {
    title: "Explain Code",
    prompt:
      "Explain the following code in detail. Break down what each part does, how the logic flows, and what the expected output should be. Use simple terms and provide examples where helpful.",
  },
  {
    title: "Optimize Performance",
    prompt:
      "Analyze the following code for performance bottlenecks and suggest optimizations. Consider time complexity, memory usage, and provide specific code improvements with explanations of why they're better.",
  },
  {
    title: "Security Audit",
    prompt:
      "Conduct a security audit of the following code. Identify potential vulnerabilities like SQL injection, XSS, authentication issues, and suggest secure coding practices and fixes.",
  },
  {
    title: "Unit Tests",
    prompt:
      "Generate comprehensive unit tests for the following code. Include test cases for normal operation, edge cases, error conditions, and use appropriate testing frameworks and best practices.",
  },
  {
    title: "Documentation",
    prompt:
      "Create detailed documentation for the following code. Include function descriptions, parameters, return values, usage examples, and any important notes about implementation details.",
  },
  {
    title: "Refactor",
    prompt:
      "Refactor the following code to improve readability, maintainability, and follow clean code principles. Break down complex functions, improve naming conventions, and apply design patterns where appropriate.",
  },
];

const AnimatedPlaceholder = () => (
  <motion.p
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.1 }}
    className="pointer-events-none w-[150px] text-sm absolute text-muted-foreground"
  >
    Stack your vibe...
  </motion.p>
);

export default function AiInput({stackDetails, sendMessage}: {stackDetails?: any, sendMessage?: any}) {
  const [value, setValue] = useState("");
  const { mutateAsync: createStack } = trpc.createStack.useMutation();
  const { mutate: createMessage } = trpc.createMessage.useMutation();
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const params = useParams();
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCommandPopover, setShowCommandPopover] = useState(false);
  const { setImage, setStacks } = useStack();
  const router = useRouter();
  const handelClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    setImagePreview(null); // Use null instead of empty string
  };

  const handelChange = (e: any) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImage(file); // Store the file in StackProvider
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async () => {
    // Default function - you can customize this
    console.log("Submitting:", value);
    if (imagePreview) {
      console.log("With image:", imagePreview);
    }
    setValue("");
    adjustHeight(true);
    if (!params.id) {
      const { stack } = await createStack();
      setStacks((prev: any) => [...prev, stack]);
      router.push(`/~/${stack.id}?message=${encodeURIComponent(value)}`);
    }else{
      const filteredFiles = treeToTemplate(filterIgnoredFiles(stackDetails?.stack?.files));
      sendMessage({
        text: value,
        files,
        },
        {
          body: {
            projectFiles: filteredFiles
          },
        }
      );
      createMessage({
        stackId: params?.id as string,
        parts: [{ type: "text", text: value }],
        role: "user",
      });
    }
  };

  useEffect(() => {
    const url = imagePreview;
    return () => {
      if (typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    };
  }, [imagePreview]);

  // Show popover if input starts with '/'
  useEffect(() => {
    if (value.startsWith("/")) {
      setShowCommandPopover(true);
    } else {
      setShowCommandPopover(false);
    }
  }, [value]);

  // Insert command prompt
  const handlePromptInsert = (prompt: string) => {
    setValue(prompt);
    setShowCommandPopover(false);
    adjustHeight();
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full py-4">
      <div className="relative max-w-xl border rounded-[22px] bg-background/50 border-border p-1 w-full mx-auto">
        <div className="relative rounded-2xl border border-border bg-neutral-800/5 flex flex-col">
          {imagePreview && (
            <div className="relative m-2">
              <div className="relative w-48 h-48 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden">
                <Image
                  className="object-cover"
                  src={imagePreview || "/picture1.jpeg"}
                  alt="selected image"
                  fill
                  sizes="(max-width: 768px) 200px, 250px"
                />
                <button
                  onClick={handelClose}
                  className="bg-secondary text-secondary-foreground absolute top-2 right-2 shadow-3xl rounded-full rotate-45 p-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
          >
            <div className="relative">
              <Popover
                open={showCommandPopover}
                onOpenChange={(open) => setShowCommandPopover(open)}
              >
                <PopoverTrigger asChild>
                  <div />
                </PopoverTrigger>
                <PopoverContent
                  className="bg-background/50 p-0 border border-border shadow-lg"
                  align="start"
                  side="top"
                  sideOffset={8}
                  style={{ minWidth: 260 }}
                >
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="flex flex-col divide-y divide-border">
                      {COMMANDS.map((cmd, idx) => (
                        <TooltipProvider key={cmd.title}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="relative group cursor-pointer px-4 py-3 hover:bg-muted/50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handlePromptInsert(cmd.prompt);
                                }}
                              >
                                <span className="font-medium text-sm">
                                  {cmd.title}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="bg-background/50 border border-border max-w-[200px] text-xs"
                            >
                              <p>{cmd.prompt}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <Textarea
                id="ai-input-04"
                value={value}
                placeholder=""
                className="w-full rounded-2xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none text-foreground resize-none focus-visible:ring-0 leading-[1.2]"
                ref={textareaRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
              />
              {!value && (
                <div className="absolute left-4 top-3">
                  <AnimatedPlaceholder />
                </div>
              )}
            </div>
          </div>

          <div className="h-12 bg-black/5 dark:bg-white/5 rounded-b-xl">
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              <label
                className={cn(
                  "cursor-pointer relative rounded-full p-2 bg-black/5 dark:bg-white/5",
                  imagePreview
                    ? "bg-destructive/15 border border-destructive text-destructive"
                    : "bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handelChange}
                  accept="image/*"
                  className="hidden"
                />
                <Paperclip
                  className={cn(
                    "w-4 h-4 text-muted-foreground hover:text-foreground transition-colors",
                    imagePreview && "text-destructive"
                  )}
                />
              </label>
              <button
                type="button"
                disabled={value.trim().length > 0}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  value.trim().length > 0
                    ? "bg-black/5 dark:bg-white/5 text-muted-foreground/50 cursor-not-allowed"
                    : "bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  setValue("/");
                  textareaRef.current?.focus();
                }}
              >
                <Command className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={value.trim().length === 0}
                      className={cn(
                        "rounded-full p-2 transition-colors",
                        value.trim().length === 0
                          ? "bg-black/5 dark:bg-white/5 text-muted-foreground/50 cursor-not-allowed"
                          : "bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enhance prompt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <button
                type="button"
                disabled={value.trim().length === 0}
                onClick={handleSubmit}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  value.trim().length === 0
                    ? "bg-black/5 dark:bg-white/5 text-muted-foreground/50 cursor-not-allowed"
                    : value
                    ? "bg-destructive/15 text-destructive"
                    : "bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
