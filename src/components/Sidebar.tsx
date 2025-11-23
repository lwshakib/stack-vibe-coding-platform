"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";
import { Code2, Menu, Plus, Search, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function Sidebar() {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/dark_logo.svg" : "/light_logo.svg";
  const { data: stacksData } = trpc.getStacks.useQuery();
  const { mutateAsync: createStack } = trpc.createStack.useMutation();
  const { mutateAsync: deleteStack } = trpc.deleteStack.useMutation();
  const utils = trpc.useUtils();
  const router = useRouter();
  const params = useParams();
  const currentStackId = params?.id as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [stackToDelete, setStackToDelete] = useState<string | null>(null);

  // Filter stacks based on search query
  const filteredStacks = useMemo(() => {
    if (!stacksData?.stacks) return [];
    if (!searchQuery.trim()) return stacksData.stacks;

    return stacksData.stacks.filter((stack) =>
      stack.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stacksData?.stacks, searchQuery]);

  // Sort stacks by creation date (newest first)
  const sortedStacks = useMemo(() => {
    return [...filteredStacks].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredStacks]);

  const handleCreateStack = async () => {
    try {
      router.push(`/`);
    } catch (error) {
      console.error("Failed to create stack:", error);
    }
  };

  const handleDeleteStack = async (stackId: string) => {
    // Instantly remove from UI by filtering out the deleted stack
    const updatedStacks =
      stacksData?.stacks?.filter((stack) => stack.id !== stackId) || [];

    // Optimistically update the UI
    utils.getStacks.setData(undefined, { stacks: updatedStacks });

    // If the deleted stack is the current one, redirect to home page
    if (stackId === currentStackId) {
      router.push("/");
    }

    // Handle actual deletion without toast
    try {
      await deleteStack({ stackId });
      // Invalidate to ensure data consistency
      utils.getStacks.invalidate();
    } catch (error) {
      // If deletion fails, revert the optimistic update
      utils.getStacks.invalidate();
      console.error("Failed to delete stack:", error);
    }
  };

  const showDeleteConfirmation = (stackId: string) => {
    setStackToDelete(stackId);
  };

  const confirmDelete = () => {
    if (stackToDelete) {
      handleDeleteStack(stackToDelete);
      setStackToDelete(null);
    }
  };

  const cancelDelete = () => {
    setStackToDelete(null);
  };

  const handleStackClick = (stackId: string) => {
    // Ensure the stack still exists before navigating
    const stackExists = stacksData?.stacks?.some(
      (stack) => stack.id === stackId
    );
    if (stackExists) {
      router.push(`/~/${stackId}`);
    } else {
      // If stack doesn't exist, redirect to home
      router.push("/");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-md text-foreground/70 hover:text-foreground hover:bg-accent/50 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[540px] flex flex-col bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border-l border-border/40 shadow-xl"
      >
        <SheetHeader className="pb-6 border-b border-border/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl ring-1 ring-primary/20 shadow-sm transition-transform duration-200 hover:scale-105">
              <Image
                src={logoSrc}
                alt="Stack Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                Stack
              </SheetTitle>
              <p className="text-sm text-muted-foreground font-medium">
                Vibe Coding Platform
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full pr-3">
            <div className="mt-6 space-y-6 mx-3 pb-6">
              {/* Create New Stack Button */}
              <div className="space-y-2">
                <Button
                  variant="default"
                  className="w-full justify-start cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  size="lg"
                  onClick={handleCreateStack}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Stack
                </Button>
                <p className="text-xs text-muted-foreground text-center font-medium">
                  Start a new coding session
                </p>
              </div>

              {/* Search Bar */}
              <div className="space-y-2">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                  <input
                    type="text"
                    placeholder="Search stacks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 text-sm font-medium placeholder:text-muted-foreground/60 hover:bg-muted/40"
                  />
                </div>
                {searchQuery && (
                  <p className="text-xs text-muted-foreground font-medium px-1">
                    {filteredStacks.length} stack
                    {filteredStacks.length !== 1 ? "s" : ""} found
                  </p>
                )}
              </div>

              <Separator className="my-6 bg-border/50" />

              {/* Stacks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-lg font-bold flex items-center space-x-2.5">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Code2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Your Stacks
                    </span>
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-semibold px-2.5 py-1 bg-muted/50 border border-border/50"
                  >
                    {stacksData?.stacks?.length || 0} total
                  </Badge>
                </div>

                <div className="space-y-2">
                  {sortedStacks && sortedStacks.length > 0 ? (
                    sortedStacks.map((stack) => (
                      <div
                        key={stack.id}
                        className={`group flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer border ${
                          stack.id === currentStackId
                            ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-primary/30 shadow-sm"
                            : "hover:bg-muted/40 text-foreground border-border/30 hover:border-border/50 hover:shadow-sm"
                        }`}
                        onClick={() => handleStackClick(stack.id)}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`p-1.5 rounded-md transition-colors duration-200 ${
                            stack.id === currentStackId
                              ? "bg-primary/20"
                              : "bg-muted/50 group-hover:bg-muted"
                          }`}>
                            <Code2
                              className={`w-4 h-4 transition-colors duration-200 ${
                                stack.id === currentStackId
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-foreground"
                              }`}
                            />
                          </div>
                          <span
                            className={`font-semibold truncate text-sm transition-colors duration-200 ${
                              stack.id === currentStackId
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {stack.name}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 h-auto w-auto rounded-md cursor-pointer ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            showDeleteConfirmation(stack.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="p-5 bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl w-20 h-20 mx-auto mb-5 flex items-center justify-center border border-border/30 shadow-sm">
                        <Code2 className="w-10 h-10 opacity-40" />
                      </div>
                      <p className="font-semibold mb-2 text-foreground/80">
                        No stacks yet
                      </p>
                      <p className="text-sm font-medium">
                        {searchQuery
                          ? "No stacks match your search"
                          : "Create your first stack to get started"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!stackToDelete}
        onOpenChange={() => setStackToDelete(null)}
      >
        <AlertDialogContent className="border-border/50 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Delete Stack
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              Are you sure you want to delete this stack? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={cancelDelete}
              className="transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
