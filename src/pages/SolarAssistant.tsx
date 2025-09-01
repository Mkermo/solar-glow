import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import SolarAssistant from '@/components/SolarAssistant';
import { SolarAssistantProvider } from '@/contexts/SolarAssistantContext';
import SolarEducationContent from '@/components/SolarEducationContent';

const SolarAssistantPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <SolarAssistantProvider>
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{t("Solar Energy Assistant", "مساعد الطاقة الشمسية")}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t(
              "Get expert advice, system calculations, and learn about solar energy with our AI-powered assistant.",
              "احصل على نصائح الخبراء وحسابات النظام وتعلم عن الطاقة الشمسية مع مساعدنا المدعوم بالذكاء الاصطناعي."
            )}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SolarAssistant />
          </div>
          <div className="lg:col-span-1">
            <SolarEducationContent />
          </div>
        </div>
      </div>
    </SolarAssistantProvider>
  );
};

export default SolarAssistantPage;
