"use client";

import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSingleStack } from "@/context/SingleStackProvider";
import { trpc } from "@/utils/trpc";
import { Download, Github, Lock } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function TopView() {
  const { resolvedTheme } = useTheme();
  const { stackDetails } = useSingleStack();
  const utils = trpc.useUtils();
  const { mutateAsync: updateStack } = trpc.updateStack.useMutation();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const currentName = stackDetails?.stack?.name ?? "";
  const stackId = stackDetails?.stack?.id as string | undefined;

  const startEditing = () => {
    setNameInput(currentName);
    setIsEditingName(true);
  };

  const cancelEditing = () => {
    setIsEditingName(false);
    setNameInput("");
  };

  const submitName = async () => {
    if (!stackId) return cancelEditing();
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === currentName) return cancelEditing();
    try {
      await updateStack({ stackId, name: trimmed });
      await utils.getStackDetails.invalidate({ stackId });
    } finally {
      setIsEditingName(false);
    }
  };
  const logoSrc =
    resolvedTheme === "dark" ? "/dark_logo.svg" : "/light_logo.svg";
  return (
    <div className="bg-background border-b border-border px-6 py-2 flex-shrink-0">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <Image
            src={logoSrc}
            alt="logo"
            width={32}
            height={32}
            className="w-6 h-6 mr-2"
          />
          <h2 className="text-foreground text-base font-medium">Stack</h2>
        </Link>

        <div className="flex items-center space-x-2">
          {isEditingName ? (
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={submitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitName();
                if (e.key === "Escape") cancelEditing();
              }}
              autoFocus
              className="h-6 px-2 py-0 text-base font-medium"
            />
          ) : (
            <h2
              className="text-foreground text-base font-medium cursor-text hover:opacity-80"
              onClick={startEditing}
              title="Click to rename"
            >
              {currentName}
            </h2>
          )}
          <Lock className="w-3 h-3 text-muted-foreground" />
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Export"
            title="Export"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="GitHub"
          >
            <Github className="w-3 h-3" />
          </Button>

          <ThemeToggle />
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
