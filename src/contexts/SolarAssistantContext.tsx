import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAIResponse, type AIMessage } from '@/services/aiService';

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

  const initialMessage = t(
    "Hello! I'm your Solar Assistant. How can I help with your solar energy questions today?",
    "مرحباً! أنا مساعدك للطاقة الشمسية. كيف يمكنني مساعدتك اليوم في أسئلتك حول الطاقة الشمسية؟"
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const inFlightController = useRef<AbortController | null>(null);

  // Save messages to local storage
  useEffect(() => {
    if (messages.length > 1) {
      const trimmed = messages.slice(-100); // keep last 100 messages
      localStorage.setItem('solarAssistantMessages', JSON.stringify(trimmed));
    }
  }, [messages]);

  // Load messages from local storage
  useEffect(() => {
    const savedMessages = localStorage.getItem('solarAssistantMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        const messagesWithDateObjects = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDateObjects);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }
  }, []);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Cancel any in-flight request
    if (inFlightController.current) {
      inFlightController.current.abort();
    }

    const controller = new AbortController();
    inFlightController.current = controller;
    setIsTyping(true);

    // Prepare short history for context
    const history: AIMessage[] = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

    getAIResponse(content, history, { language: lang, abortSignal: controller.signal })
      .then((aiResponse) => {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: aiResponse || t('Sorry, I could not generate a response.', 'عذراً، لم أتمكن من إنشاء إجابة.'),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      })
      .catch((err) => {
        if ((err as any)?.name === 'AbortError') return; // Ignore aborted
        console.error('AI error:', err);
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: t('There was an issue answering. Please try again.', 'حدثت مشكلة أثناء الإجابة. يرجى المحاولة مرة أخرى.'),
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
    const initialMessage = t(
      "Hello! I'm your Solar Assistant. How can I help with your solar energy questions today?",
      "مرحباً! أنا مساعدك للطاقة الشمسية. كيف يمكنني مساعدتك اليوم في أسئلتك حول الطاقة الشمسية؟"
    );

    setMessages([
      {
        id: uuidv4(),
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date(),
      },
    ]);
    localStorage.removeItem('solarAssistantMessages');
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
