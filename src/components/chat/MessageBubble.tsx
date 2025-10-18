import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  role: 'user' | 'assistant';
  content: string;
};

export const MessageBubble: React.FC<Props> = ({ role, content }) => {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-start gap-3 max-w-[80%]">
        {!isUser && (
          <Avatar>
            <AvatarImage src="/solar-assistant.png" alt="Solar Assistant" />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
        )}
        <div
          className={`rounded-lg px-4 py-2 whitespace-pre-wrap ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          {content}
        </div>
        {isUser && (
          <Avatar>
            <AvatarImage src="/user-avatar.png" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

export const TypingBubble: React.FC = () => (
  <div className="flex justify-start">
    <div className="flex items-start gap-3 max-w-[80%]">
      <Avatar>
        <AvatarImage src="/solar-assistant.png" alt="Solar Assistant" />
        <AvatarFallback>SA</AvatarFallback>
      </Avatar>
      <div className="rounded-lg px-4 py-2 bg-muted">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
);

