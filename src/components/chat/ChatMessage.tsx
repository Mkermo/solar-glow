
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@supabase/supabase-js";
import { getSafeStorageUrl } from "@/lib/storageUtils";

export interface ChatMessageProps {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user_email?: string;
  currentUser: User | null;
}

export const getUserColor = (userId: string) => {
  const colors = [
    "bg-blue-500", "bg-green-500", "bg-yellow-500", 
    "bg-purple-500", "bg-pink-500", "bg-indigo-500"
  ];
  
  // Simple hash function to select color
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return colors[hash % colors.length];
};

export const ChatMessage = ({
  content,
  user_id,
  created_at,
  user_email,
  currentUser
}: ChatMessageProps) => {
  const isCurrentUser = currentUser && user_id === currentUser.id;
  
  return (
    <div 
      className={`flex items-start gap-3 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className={`text-xs ${getUserColor(user_id)}`}>
            {user_email 
              ? user_email.charAt(0).toUpperCase() 
              : "U"}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <p>{content}</p>
        <p className="text-xs opacity-70 mt-1">
          {new Date(created_at).toLocaleTimeString()}
        </p>
      </div>
      {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={getSafeStorageUrl(currentUser.user_metadata?.avatar_url)} />
          <AvatarFallback className="bg-primary">
            {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
