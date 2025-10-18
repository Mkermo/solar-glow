import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/contexts/LanguageContext';
import { useSolarAssistant } from '@/contexts/SolarAssistantContext';
import { Send, Calculator, RefreshCw } from "lucide-react";
import SolarCalculator from './SolarCalculator';
import { suggestedQuestions } from '@/data/solarAssistantSuggestions';
import { MessageBubble, TypingBubble } from '@/components/chat/MessageBubble';
import { getAIProvider } from '@/services/aiService';

const SolarAssistant: React.FC = () => {
  const { t, lang } = useLanguage();
  const { messages, isTyping, sendMessage, clearMessages, showCalculator, toggleCalculator } = useSolarAssistant();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const categories = useMemo(() => Array.from(new Set(suggestedQuestions.map(item => item.category))), []);

  const providerLabel = useMemo(() => {
    const m = getAIProvider();
    if (m === 'custom') return t('AI: Server', 'الذكاء الاصطناعي: خادم');
    if (m === 'openai') return t('AI: OpenAI', 'الذكاء الاصطناعي: OpenAI');
    return t('AI: Local', 'الذكاء الاصطناعي: محلي');
  }, [t]);

  return (
    <Card className="w-full max-w-4xl mx-auto min-h-[700px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>{t('Solar Assistant', 'مساعد الطاقة الشمسية')}</CardTitle>
          <CardDescription>{t('Get help with your solar energy questions', 'احصل على مساعدة لأسئلتك حول الطاقة الشمسية')}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground px-2 py-1 rounded-full border">{providerLabel}</span>
          <Button variant="outline" size="sm" onClick={toggleCalculator}>
            <Calculator className="h-4 w-4 mr-2" />
            {t('Calculator', 'الحاسبة')}
          </Button>
          <Button variant="outline" size="sm" onClick={clearMessages}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('New Chat', 'محادثة جديدة')}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-grow overflow-auto">
        {showCalculator && <div className="mb-4"><SolarCalculator /></div>}

        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map(category => {
            const categoryItem = suggestedQuestions.find(item => item.category === category);
            const displayName = lang === 'ar' && (categoryItem as any)?.categoryAr ? (categoryItem as any).categoryAr : category;
            return (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
              >
                {displayName}
              </Badge>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(() => {
              const categoryItem = suggestedQuestions.find(item => item.category === selectedCategory);
              const questions = lang === 'ar' && (categoryItem as any)?.questionsAr ? (categoryItem as any).questionsAr : (categoryItem?.questions || []);
              return questions.map((q: string, idx: number) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2 px-3"
                  onClick={() => {
                    sendMessage(q);
                    setSelectedCategory(null);
                  }}
                >
                  {q}
                </Button>
              ));
            })()}
          </div>
        )}

        <div className="space-y-4 pb-2">
          {messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} content={message.content} />
          ))}
          {isTyping && <TypingBubble />}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <CardFooter>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            placeholder={t('Type your message...', 'اكتب رسالتك...')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default SolarAssistant;

