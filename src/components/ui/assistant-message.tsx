import { Bot } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Card, CardContent } from "./card";

interface AssistantMessageProps {
  content: string;
  timestamp?: string;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  timestamp,
}) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-2 max-w-[80%]">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <Card className="bg-muted border-border">
            <CardContent className="p-3">
              <p className="text-sm whitespace-pre-wrap break-words">
                {content}
              </p>
            </CardContent>
          </Card>
          {timestamp && (
            <span className="text-xs text-muted-foreground mt-1 ml-1">
              {timestamp}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantMessage;
