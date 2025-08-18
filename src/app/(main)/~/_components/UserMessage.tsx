import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

interface UserMessageProps {
  content: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
  return (
    <div className="flex justify-end mb-4">
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="flex flex-col items-end">
          <div className="bg-primary text-primary-foreground border border-primary rounded-lg p-3">
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          </div>
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
