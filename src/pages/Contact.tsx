import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  return (
    <div className="container py-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      <h1 className="text-3xl font-bold mb-6">
        {t("contact", "title")}
      </h1>
      <form className="max-w-lg space-y-4">
        <div>
          <label className="block mb-2">
            {t("contact", "name")}
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder={t("contact", "name")}
          />
        </div>
        <div>
          <label className="block mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            placeholder="youremail@domain.com"
          />
        </div>
        <div>
          <label className="block mb-2">
            Message
          </label>
          <textarea
            rows={4}
            className="w-full p-2 border rounded"
            placeholder="How can we help you?"
          />
        </div>
        <button type="submit" className="btn-primary">
          {t("contact", "send")}
        </button>
      </form>
    </div>
  );
};

export default Contact;
