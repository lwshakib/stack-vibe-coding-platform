import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Card, CardContent } from "./card";

interface UserMessageProps {
  content: string;
  timestamp?: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ content, timestamp }) => {
  return (
    <div className="flex justify-end mb-4">
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="flex flex-col items-end">
          <Card className="bg-primary text-primary-foreground border-primary">
            <CardContent className="p-3">
              <p className="text-sm whitespace-pre-wrap break-words">
                {content}
              </p>
            </CardContent>
          </Card>
          {timestamp && (
            <span className="text-xs text-muted-foreground mt-1">
              {timestamp}
            </span>
          )}
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src="/user-avatar.png" alt="User" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default UserMessage;
