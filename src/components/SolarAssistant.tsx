import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/contexts/LanguageContext';
import { useSolarAssistant } from '@/contexts/SolarAssistantContext';
import { Send, Calculator, RefreshCw } from "lucide-react";
import SolarCalculator from './SolarCalculator';
import { suggestedQuestions } from '@/data/solarAssistantSuggestions';

// Component for rendering the Solar Assistant
const SolarAssistant: React.FC = () => {
  const { t } = useLanguage();
  const { messages, isTyping, sendMessage, clearMessages, showCalculator, toggleCalculator } = useSolarAssistant();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Get unique categories from suggested questions
  const categories = Array.from(
    new Set(suggestedQuestions.map(item => item.category))
  );
  
  // Get the current language for category display
  const { lang } = useLanguage();

  return (
    <Card className="w-full max-w-4xl mx-auto min-h-[700px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('Solar Assistant', 'مساعد الطاقة الشمسية')}</CardTitle>
          <CardDescription>{t('Get help with your solar energy questions', 'احصل على المساعدة بخصوص أسئلة الطاقة الشمسية')}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleCalculator}>
            <Calculator className="h-4 w-4 mr-2" />
            {t('Calculator', 'الآلة الحاسبة')}
          </Button>
          <Button variant="outline" size="sm" onClick={clearMessages}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('New Chat', 'محادثة جديدة')}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto">
        {showCalculator && <div className="mb-4"><SolarCalculator /></div>}
        
        {/* Suggested Questions Categories */}
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map(category => {
            // Find the category object to get Arabic name if needed
            const categoryItem = suggestedQuestions.find(item => item.category === category);
            const displayName = lang === 'ar' && categoryItem?.categoryAr 
              ? categoryItem.categoryAr 
              : category;
              
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
        
        {/* Suggested Questions */}
        {selectedCategory && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(() => {
              const categoryItem = suggestedQuestions.find(item => item.category === selectedCategory);
              const questions = lang === 'ar' && categoryItem?.questionsAr 
                ? categoryItem.questionsAr 
                : categoryItem?.questions || [];
                
              return questions.map((q, idx) => (
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
        
        {/* Chat Messages */}
        <div className="space-y-4 pb-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-3 max-w-[80%]">
                {message.role === 'assistant' && (
                  <Avatar>
                    <AvatarImage src="/solar-assistant.png" alt="Solar Assistant" />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <Avatar>
                    <AvatarImage src="/user-avatar.png" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
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
          )}
          
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
