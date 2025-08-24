
import { Loader2, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChatMessage, ChatMessageProps } from "./ChatMessage";
import { User } from "@supabase/supabase-js";

interface ChatMessageListProps {
  messages: Omit<ChatMessageProps, 'currentUser'>[];
  loading: boolean;
  user: User | null;
}

export const ChatMessageList = ({ messages, loading, user }: ChatMessageListProps) => {
  const { t } = useLanguage();
  
  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">
          {t("No messages yet", "لا توجد رسائل بعد")}
        </p>
        <p className="text-muted-foreground">
          {t(
            "Be the first to start a conversation!",
            "كن أول من يبدأ المحادثة!"
          )}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <ChatMessage 
          key={message.id} 
          {...message} 
          currentUser={user} 
        />
      ))}
    </div>
  );
};
