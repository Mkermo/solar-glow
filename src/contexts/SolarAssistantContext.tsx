import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateSolarAIResponse } from '@/lib/solarAIResponses';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { lang } = useLanguage();
  
  const initialMessage = lang === 'ar' 
    ? 'مرحباً! أنا مساعد الطاقة الشمسية. كيف يمكنني مساعدتك في أسئلتك حول الطاقة الشمسية اليوم؟'
    : 'Hello! I\'m your Solar Assistant. How can I help you with your solar energy questions today?';
    
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

  // Save messages to local storage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('solarAssistantMessages', JSON.stringify(messages));
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
    setIsTyping(true);

    // Simulate AI response generation with a slight delay for realism
    setTimeout(() => {
      const aiResponse = generateSolarAIResponse(content, messages, lang);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const clearMessages = () => {
    const initialMessage = lang === 'ar' 
      ? 'مرحباً! أنا مساعد الطاقة الشمسية. كيف يمكنني مساعدتك في أسئلتك حول الطاقة الشمسية اليوم؟'
      : 'Hello! I\'m your Solar Assistant. How can I help you with your solar energy questions today?';
      
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
