import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAIResponse, type AIMessage } from '@/services/aiService';
import { useAuth } from '@/contexts/AuthContext';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type SolarAssistantContextType = {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  showCalculator: boolean;
  toggleCalculator: () => void;
};

const SolarAssistantContext = createContext<SolarAssistantContextType | undefined>(undefined);

export const SolarAssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const initialMessage = useMemo(
    () =>
      t(
        "Hello! I'm your Solar Assistant. How can I help with your solar energy questions today?",
        "مرحباً! أنا مساعدك للطاقة الشمسية. كيف يمكنني مساعدتك اليوم في أسئلتك حول الطاقة الشمسية؟"
      ),
    [t]
  );

  const buildInitialMessages = useCallback(
    (): Message[] => [
      {
        id: uuidv4(),
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date(),
      },
    ],
    [initialMessage]
  );

  const [messages, setMessages] = useState<Message[]>(buildInitialMessages);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const inFlightController = useRef<AbortController | null>(null);

  const storageKey = useMemo(() => {
    const suffix = user?.id ? user.id : 'guest';
    return `solarAssistantMessages_${suffix}`;
  }, [user?.id]);

  const getSessionStore = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.sessionStorage;
    } catch (error) {
      console.warn('Session storage unavailable:', error);
      return null;
    }
  }, []);

  // Keep session storage up to date with the latest messages
  useEffect(() => {
    const storage = getSessionStore();
    if (!storage) return;

    if (messages.length > 1) {
      const trimmed = messages.slice(-100);
      storage.setItem(storageKey, JSON.stringify(trimmed));
    } else if (messages.length === 1 && messages[0].role === 'assistant') {
      storage.removeItem(storageKey);
    }
  }, [messages, storageKey, getSessionStore]);

  // Restore messages for the active user/session
  useEffect(() => {
    const storage = getSessionStore();
    if (!storage) {
      setMessages(buildInitialMessages());
      return;
    }

    const savedMessages = storage.getItem(storageKey);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
        return;
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }

    setMessages(buildInitialMessages());
  }, [storageKey, buildInitialMessages, getSessionStore]);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    if (inFlightController.current) {
      inFlightController.current.abort();
    }

    const controller = new AbortController();
    inFlightController.current = controller;
    setIsTyping(true);

    const history: AIMessage[] = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

    getAIResponse(content, history, { language: lang, abortSignal: controller.signal })
      .then((aiResponse) => {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content:
            aiResponse ||
            t('Sorry, I could not generate a response.', 'عذراً، لم أتمكن من إنشاء إجابة.'),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      })
      .catch((err) => {
        if ((err as any)?.name === 'AbortError') return;
        console.error('AI error:', err);
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: t(
            'There was an issue answering. Please try again.',
            'حدثت مشكلة أثناء الإجابة. يرجى المحاولة مرة أخرى.'
          ),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      })
      .finally(() => {
        if (inFlightController.current === controller) {
          inFlightController.current = null;
        }
        setIsTyping(false);
      });
  };

  const clearMessages = () => {
    setMessages(buildInitialMessages());
    const storage = getSessionStore();
    if (storage) {
      storage.removeItem(storageKey);
    }
  };

  const toggleCalculator = () => {
    setShowCalculator((prev) => !prev);
  };

  return (
    <SolarAssistantContext.Provider
      value={{
        messages,
        isTyping,
        sendMessage,
        clearMessages,
        showCalculator,
        toggleCalculator,
      }}
    >
      {children}
    </SolarAssistantContext.Provider>
  );
};

export const useSolarAssistant = (): SolarAssistantContextType => {
  const context = useContext(SolarAssistantContext);
  if (context === undefined) {
    throw new Error('useSolarAssistant must be used within a SolarAssistantProvider');
  }
  return context;
};
