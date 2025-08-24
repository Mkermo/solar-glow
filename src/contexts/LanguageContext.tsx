import { createContext, useContext, useState, useEffect } from "react";

type LanguageContextType = {
  lang: "en" | "ar";
  setLang: (lang: "en" | "ar") => void;
  t: (english: string, arabic: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<"en" | "ar">(() => {
    return (localStorage.getItem("language") as "en" | "ar") || "en";
  });

  // Simple translation function
  const t = (english: string, arabic: string): string => {
    return lang === "ar" ? arabic : english;
  };

  useEffect(() => {
    localStorage.setItem("language", lang);

    // Remove RTL/LTR direction from document
    document.documentElement.removeAttribute("dir");

    // Add a global CSS class for language instead of direction
    document.documentElement.classList.remove("lang-en", "lang-ar");
    document.documentElement.classList.add(`lang-${lang}`);

    // Set lang attribute for accessibility
    document.documentElement.lang = lang;

    // Add global style to disable automatic RTL/LTR text direction
    const styleId = "disable-rtl-style";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      /* Override any RTL direction on elements */
      [dir="rtl"] {
        direction: ltr !important;
      }
      
      /* Force all elements to maintain LTR layout */
      * {
        direction: ltr !important;
      }
      
      /* Maintain text alignment for Arabic */
      .lang-ar .arabic-text {
        text-align: right;
      }
    `;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Example component using the language context
export function ExampleComponent() {
  const { lang, t } = useLanguage();

  return (
    <p className={lang === "ar" ? "arabic-text" : ""}>
      {t("Some English text", "النص العربي هنا")}
    </p>
  );
}
