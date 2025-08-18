"use client";

import AiInput from "@/components/ui/ai-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { useSingleStack } from "@/context/SingleStackProvider";
import { trpc } from "@/utils/trpc";
import { useParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import AssistantMessage from "./AssistantMessage";
import UserMessage from "./UserMessage";
// Using loose types here to avoid deep UIMessage generics from @ai-sdk/react

const MessageSkeleton: React.FC = () => (
  <div className="space-y-4">
    {/* User message skeleton */}
    <div className="flex justify-end mb-4">
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="flex flex-col items-end">
          <div className="bg-secondary rounded-lg p-3 w-48">
            <div className="h-4 bg-muted-foreground/30 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-8 w-8 bg-secondary rounded-full animate-pulse"></div>
      </div>
    </div>

    {/* Assistant message skeleton */}
    <div className="flex justify-start mb-4">
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="h-8 w-8 bg-secondary rounded-full animate-pulse"></div>
        <div className="flex flex-col">
          <div className="bg-secondary rounded-lg p-3 w-64">
            <div className="space-y-2">
              <div className="h-4 bg-muted-foreground/30 rounded animate-pulse"></div>
              <div className="h-4 bg-muted-foreground/30 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-muted-foreground/30 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Another user message skeleton */}
    <div className="flex justify-end mb-4">
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="flex flex-col items-end">
          <div className="bg-secondary rounded-lg p-3 w-32">
            <div className="h-4 bg-muted-foreground/30 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-8 w-8 bg-secondary rounded-full animate-pulse"></div>
      </div>
    </div>

    {/* Another assistant message skeleton */}
    <div className="flex justify-start mb-4">
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="h-8 w-8 bg-secondary rounded-full animate-pulse"></div>
        <div className="flex flex-col">
          <div className="bg-secondary rounded-lg p-3 w-56">
            <div className="space-y-2">
              <div className="h-4 bg-muted-foreground/30 rounded animate-pulse"></div>
              <div className="h-4 bg-muted-foreground/30 rounded w-4/5 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LeftSideView: React.FC = () => {
  const params = useParams();
  const { messages, setMessages, onResponseFinish, setOnResponseFinish, stackDetails, sendMessage, streamingStatus, stopStreaming } =
    useSingleStack();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: previousMessages, isLoading: messagesLoading } =
    trpc.getMessages.useQuery({
      stackId: params?.id as string,
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (previousMessages) {
      setMessages(previousMessages.data);
    }
  }, [previousMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="p-4">
          {messagesLoading ? (
            <MessageSkeleton />
          ) : messages && messages.length > 0 ? (
            messages.map((message: any, index: number) =>
              message.role === "user" ? (
                <UserMessage key={index} content={message.parts.find((p: any)=> p.type === "text").text} />
              ) : (
                message.parts.map((part: any, partIndex: number) => {
                  switch (part.type) {
                    case "reasoning":
                      return (
                        <Reasoning
                          key={`${message.id}-${partIndex}`}
                          className="w-full"
                          isStreaming={streamingStatus === 'streaming'}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    case "text":
                      return (
                        <AssistantMessage
                          key={`${index}-${partIndex}`}
                          content={part.text}
                          lastMessage={index === messages.length - 1}
                        />
                      );
                    default:
                      return null;
                  }
                })
              )
            )
          ) : (
            <div className="text-center text-muted-foreground mt-8">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex-shrink-0 px-4">
        <AiInput stackDetails={stackDetails} sendMessage={sendMessage} stopStreaming={stopStreaming} streamingStatus={streamingStatus} />
      </div>
    </div>
  );
};

export default LeftSideView;
