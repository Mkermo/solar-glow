
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { fetchMessages, sendMessage, setupChatSubscription, ChatMessage } from "@/services/chatService";
import { toast } from "@/hooks/use-toast";

const Chat = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await fetchMessages();
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  // Setup real-time subscription
  useEffect(() => {
    const cleanup = setupChatSubscription((newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    return cleanup;
  }, []);

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!user) return;
    
    try {
      await sendMessage(content, user.id);
      // The message will be added through the realtime subscription
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <MessageSquare className="h-8 w-8" />
          {t("Community Chat", "محادثة المجتمع")}
        </h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("Live Chat", "محادثة مباشرة")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto border rounded-md p-4 mb-4">
              <ChatMessageList 
                messages={messages}
                loading={loading}
                user={user}
              />
            </div>
          </CardContent>
          <CardFooter>
            <ChatInput 
              user={user}
              onSendMessage={handleSendMessage}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
