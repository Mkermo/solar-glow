import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SunDial from "@/components/decor/SunDial";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-ink text-paper">
      <div aria-hidden className="absolute right-[-10%] top-1/2 w-[50vmin] -translate-y-1/2 opacity-20">
        <SunDial className="text-paper" />
      </div>

      <div className="container relative">
        <p className="kicker text-solar">{t("Lost Page", "صفحة مفقودة")}</p>
        <h1 className="mt-6 font-serif text-display-xl">
          4<em className="text-gloss">0</em>4
        </h1>
        <p className="mt-6 max-w-md text-paper/65">
          {t(
            "This page never made it to print. The catalogue, however, is fully in stock.",
            "هذه الصفحة لم تصل إلى الطباعة. لكن الكتالوج متوفر بالكامل.",
          )}
        </p>
        <Link
          to="/"
          className="shine mt-10 inline-flex items-center gap-3 bg-solar px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-solar-glow"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Back to the front page", "العودة للصفحة الرئيسية")}
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
