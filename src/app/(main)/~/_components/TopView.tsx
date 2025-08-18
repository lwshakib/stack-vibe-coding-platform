"use client";

import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Github,
  Grid3X3,
  Lock,
  MoreVertical,
  Plus,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export default function TopView() {
  const { resolvedTheme } = useTheme();
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
          <h2 className="text-foreground text-base font-medium">StackVibe</h2>
          <Lock className="w-3 h-3 text-muted-foreground" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-3">
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
