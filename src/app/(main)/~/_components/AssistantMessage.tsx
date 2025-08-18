"use client";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSingleStack } from "@/context/SingleStackProvider";
import parseStackArtifact from "@/utils/parser";
import { trpc } from "@/utils/trpc";
import { Bot, CheckCircle, Clock, Loader2 } from "lucide-react";
import React from "react";

interface AssistantMessageProps {
  content: string;
  lastMessage: boolean;
  reasoningText?: string;
  isStreaming?: boolean;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  lastMessage = false,
  reasoningText,
  isStreaming = false,
}) => {
  const {
    onResponseFinish,
    stackDetails,
    mountAndRun,
    setOnResponseFinish,
    webContainerInstance,
    bootWebContainer,
    mountFiles,
  } = useSingleStack();
  const { mutateAsync: updateTemplate } = trpc.updateStack.useMutation();
  const parsedContent = parseStackArtifact(content);
  const utils = trpc.useUtils();

  React.useEffect(() => {
    if (!(onResponseFinish && stackDetails.stack.files && lastMessage)) return;

    let cancelled = false;
    async function run() {
      let instance;
      if (!webContainerInstance) {
        instance = await bootWebContainer();
      } else {
        instance = webContainerInstance;
      }

      const deepMerge = (target: any, source: any) => {
        const result = { ...target };
        for (const key in source) {
          if (
            source[key] &&
            typeof source[key] === "object" &&
            !Array.isArray(source[key])
          ) {
            result[key] = deepMerge(target[key] || {}, source[key]);
          } else {
            result[key] = source[key];
          }
        }
        return result;
      };

      const files = deepMerge(
        stackDetails.stack.files,
        parsedContent.files.files
      );

      if (!cancelled && instance) {
        await mountAndRun(files, instance);
      }
      if (!cancelled) {
        setOnResponseFinish(false);
      }

      if (!cancelled) {
        await updateTemplate({
          files: files,
          stackId: stackDetails.stack.id,
        });
        utils.getStackDetails.invalidate({
          stackId: stackDetails.stack.id,
        });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [onResponseFinish, stackDetails?.stack?.files, lastMessage]);

  // Check if there are any files being processed
  const hasProcessingFiles = parsedContent.progress.files.some(
    (file) => file.status === "PROCESSING"
  );

  // Check if there are any files at all
  const hasFiles = parsedContent.progress.files.length > 0;

  // Get default open accordion values (files that are processing)
  const defaultOpenValues = parsedContent.progress.files
    .map((file, index) =>
      file.status === "PROCESSING" ? `file-${index}` : null
    )
    .filter(Boolean) as string[];

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-2 w-full min-w-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 max-w-[80%] min-w-0">
          {/* Combined Introduction and Progress */}
          {(parsedContent.introduction || hasFiles) && (
            <div className="bg-muted border border-border rounded-lg p-3">
              <div className="space-y-3">
                {reasoningText && (
                  <Reasoning className="w-full" isStreaming={isStreaming}>
                    <ReasoningTrigger />
                    <ReasoningContent>{reasoningText}</ReasoningContent>
                  </Reasoning>
                )}
                {/* Introduction */}
                {parsedContent.introduction && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {parsedContent.introduction}
                  </p>
                )}

                {/* Files Section with Accordion */}
                {hasFiles && (
                  <div className="space-y-2">
                    <Accordion
                      type="multiple"
                      className="w-full bg-background/50 rounded-md p-2"
                      defaultValue={defaultOpenValues}
                    >
                      <AccordionItem value="files" className="border-none">
                        <AccordionTrigger className="py-2 hover:no-underline px-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">
                              {parsedContent.files?.title || "Files"}
                            </h4>
                            {hasProcessingFiles && (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <div className="space-y-1 pl-4">
                            {parsedContent.progress.files.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-xs py-1"
                              >
                                <span className="truncate max-w-[200px]">
                                  {file.fullPath}
                                </span>
                                <Badge
                                  variant={
                                    file.status === "COMPLETED"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="ml-2"
                                >
                                  {file.status === "PROCESSING" ? (
                                    <Clock className="h-3 w-3" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3" />
                                  )}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw content fallback if no parsing occurred */}
          {!hasFiles && (
            <Card className="bg-muted border-border">
              <CardContent className="p-3 overflow-hidden">
                {reasoningText && (
                  <div className="mb-2">
                    <Reasoning className="w-full" isStreaming={isStreaming}>
                      <ReasoningTrigger />
                      <ReasoningContent>{reasoningText}</ReasoningContent>
                    </Reasoning>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">
                  {content}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantMessage;
