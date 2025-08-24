import { Info } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  return (
    <div className="container py-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <Info size={30} className="text-solar-blue" />
        <h1 className="text-3xl font-bold text-solar-blue">
          Powering a Sustainable Future, One Solar Panel at a Time
        </h1>
      </div>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("about", "mission")}
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            SolarG is dedicated to providing high-quality solar equipment to power your home, business, and beyond.
            Our mission is to accelerate the world’s transition to sustainable energy by making solar more accessible and affordable to everyone.
          </p>
          <p className="text-md text-gray-600 mb-2">
            <span className="font-semibold">What we offer:</span>
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
            <li>Cutting-edge solar panels, inverters, and batteries</li>
            <li>Expert advice and guidance for installations</li>
            <li>Dedicated customer support</li>
          </ul>
          <p className="text-gray-600">
            Learn more about our journey, our values, and how we are making a brighter, cleaner future possible for all.
          </p>
        </section>
        {/* Other sections */}
      </div>
    </div>
  );
};

export default About;
