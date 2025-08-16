"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import AiInput from "@/components/ui/ai-input";
import { trpc } from "@/utils/trpc";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function Home() {
  const { mutate } = trpc.createStack.useMutation();
  const { resolvedTheme } = useTheme();

  // Determine which logo to use based on resolved theme
  const logoSrc =
    resolvedTheme === "dark" ? "/dark_logo.svg" : "/light_logo.svg";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-6 h-8">
                <Image
                  src={logoSrc}
                  alt="Stack Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Stack</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-4xl">
          <AiInput />
        </div>
      </div>
    </div>
  );
}
