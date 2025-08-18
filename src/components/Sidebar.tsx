"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useStack } from "@/context/StackProvider";
import { trpc } from "@/utils/trpc";
import { Code2, Menu, Plus, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
  const [deletingStackId, setDeletingStackId] = useState<string | null>(null);

  const handleCreateStack = async () => {
    try {
      const { stack } = await createStack();
      router.push(`/~/${stack.id}`);
    } catch (error) {
      console.error("Failed to create stack:", error);
    }
  };

  const handleDeleteStack = async (stackId: string) => {
    setDeletingStackId(stackId);

    toast.promise(
      deleteStack({ stackId }).then(() => {
        utils.getStacks.invalidate();
        setDeletingStackId(null);

        // If the deleted stack is the current one, redirect to home page
        if (stackId === currentStackId) {
          router.push("/");
        }
      }),
      {
        loading: "Deleting stack...",
        success: "Stack deleted successfully",
        error: "Failed to delete stack",
      }
    );
  };

  const handleStackClick = (stackId: string) => {
    router.push(`/~/${stackId}`);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground/70 hover:text-foreground"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader className="pb-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Image
                src={logoSrc}
                alt="Stack Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">Stack</SheetTitle>
              <p className="text-sm text-muted-foreground">Coding Platform</p>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6 mx-2">
          {/* Create New Stack Button */}
          <Button
            className="w-full justify-start cursor-pointer"
            size="lg"
            variant="outline"
            onClick={handleCreateStack}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Stack
          </Button>

          {/* Stacks Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Previous Stacks</h3>
            <div className="space-y-2">
              {stacksData?.stacks && stacksData.stacks.length > 0 ? (
                stacksData.stacks.map((stack) => (
                  <div
                    key={stack.id}
                    className={`relative flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer overflow-hidden ${
                      stack.id === currentStackId
                        ? "bg-primary/20 border border-primary/30"
                        : "bg-muted/50 hover:bg-muted/70"
                    }`}
                    onClick={() => handleStackClick(stack.id)}
                  >
                    {deletingStackId === stack.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    )}
                    <div className="flex items-center space-x-3">
                      <Code2
                        className={`w-4 h-4 ${
                          stack.id === currentStackId
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <p
                        className={`font-medium ${
                          stack.id === currentStackId
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {stack.name}
                      </p>
                      {stack.id === currentStackId && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingStackId === stack.id}
                      className={`${
                        deletingStackId === stack.id
                          ? "text-muted-foreground cursor-not-allowed"
                          : "text-destructive hover:text-destructive hover:bg-destructive/10"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStack(stack.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Code2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No stacks yet</p>
                  <p className="text-sm">
                    Create your first stack to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
