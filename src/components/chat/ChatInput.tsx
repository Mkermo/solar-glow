
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LogIn, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface ChatInputProps {
  user: User | null;
  onSendMessage: (message: string) => Promise<void>;
}

export const ChatInput = ({ user, onSendMessage }: ChatInputProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login', { state: { from: '/chat' } });
      return;
    }
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      await onSendMessage(newMessage);
      setNewMessage("");
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full flex justify-between items-center">
        <p className="text-muted-foreground">
          {t("Log in to join the conversation", "سجل الدخول للانضمام إلى المحادثة")}
        </p>
        <Button onClick={() => navigate('/login', { state: { from: '/chat' } })}>
          <LogIn className="mr-2 h-4 w-4" />
          {t("Log In", "تسجيل الدخول")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <Input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder={t("Type your message...", "اكتب رسالتك...")}
        disabled={sending}
        className="flex-1"
      />
      <Button type="submit" disabled={sending || !newMessage.trim()}>
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            {t("Send", "إرسال")}
          </>
        )}
      </Button>
    </form>
  );
};
