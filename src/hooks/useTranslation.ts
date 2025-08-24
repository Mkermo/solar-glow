import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

export const useTranslation = () => {
  const { lang } = useLanguage();

  const t = (page: keyof typeof translations, key: string, params?: Record<string, string>) => {
    let text = translations[page]?.[lang]?.[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, value);
      });
    }
    
    return text;
  };

  return { t };
};