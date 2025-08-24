
import { FileText } from "lucide-react";

const TermsOfService = () => (
  <div className="py-16 px-4 container mx-auto max-w-2xl animate-fade-in">
    <div className="flex items-center gap-3 mb-6">
      <FileText className="text-solar-blue" size={30} />
      <h1 className="text-3xl font-bold text-solar-blue">Terms of Service</h1>
    </div>
    <h2 className="text-xl font-semibold mb-4">Please Read Carefully</h2>
    <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-1">
      <li>Use of this website constitutes acceptance of our terms and conditions.</li>
      <li>All content is provided for informational purposes and may be updated without notice.</li>
      <li>Product availability, pricing, and offers are subject to change.</li>
      <li>User accounts must not be used for fraudulent activity.</li>
      <li>Personal information is handled in accordance with our stated policies and applicable laws.</li>
      <li>Any unauthorized resale or distribution is prohibited.</li>
    </ol>
    <p className="text-gray-600">
      For any questions regarding these terms, feel free to contact us.
    </p>
  </div>
);

export default TermsOfService;

{/*import { useState } from "react";
import { FileText } from "lucide-react";

const translations = {
  en: {
    title: "Terms of Service",
    subtitle: "Please Read Carefully",
    terms: [
      "Use of this website constitutes acceptance of our terms and conditions.",
      "All content is provided for informational purposes and may be updated without notice.",
      "Product availability, pricing, and offers are subject to change.",
      "User accounts must not be used for fraudulent activity.",
      "Personal information is handled in accordance with our stated policies and applicable laws.",
      "Any unauthorized resale or distribution is prohibited.",
    ],
    footer: "For any questions regarding these terms, feel free to contact us.",
  },
  ar: {
    title: "شروط الخدمة",
    subtitle: "يرجى القراءة بعناية",
    terms: [
      "استخدام هذا الموقع يعني موافقتك على الشروط والأحكام.",
      "جميع المحتويات لأغراض إعلامية وقد يتم تحديثها دون إشعار.",
      "توفر المنتجات والأسعار والعروض قابلة للتغيير.",
      "يُمنع استخدام حسابات المستخدمين لأي نشاط احتيالي.",
      "يتم التعامل مع المعلومات الشخصية وفقًا لسياساتنا والقوانين المعمول بها.",
      "يُحظر أي إعادة بيع أو توزيع غير مصرح به.",
    ],
    footer: "لأي استفسارات حول هذه الشروط، لا تتردد في الاتصال بنا.",
  },
};

const TermsOfService = () => {
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  return (
    <div className="py-16 px-4 container mx-auto max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-solar-blue" size={30} />
        <h1 className="text-3xl font-bold text-solar-blue">{t.title}</h1>
      </div>

      <h2 className="text-xl font-semibold mb-4">{t.subtitle}</h2>

      <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-1">
        {t.terms.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>

      <p className="text-gray-600">{t.footer}</p>

      <div className="mt-6">
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="px-4 py-2 bg-solar-blue text-white rounded"
        >
          Switch to {lang === "en" ? "Arabic" : "English"}
        </button>
      </div>
    </div>
  );
};

export default TermsOfService;
*/}