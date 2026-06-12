import StaticArticle from "@/components/layout/StaticArticle";
import { useLanguage } from "@/contexts/LanguageContext";

const SolarEducation = () => {
  const { t } = useLanguage();

  return (
    <StaticArticle
      kicker={t("Field Notes", "ملاحظات ميدانية")}
      title={
        <>
          {t("Solar,", "الطاقة الشمسية،")} <em className="text-gloss">{t("explained", "ببساطة")}</em>
        </>
      }
      intro={t(
        "A short primer on how a photovoltaic system actually works — from photon to socket.",
        "مقدمة قصيرة عن كيفية عمل النظام الكهروضوئي فعلياً — من الفوتون إلى المقبس.",
      )}
      sections={[
        {
          heading: t("Panels make DC power", "الألواح تنتج تياراً مستمراً"),
          body: t(
            "Photovoltaic cells convert sunlight directly into direct current. Modern monocrystalline panels reach 21–25% efficiency, and bifacial designs harvest reflected light from both faces.",
            "تحول الخلايا الكهروضوئية ضوء الشمس مباشرة إلى تيار مستمر. تصل الألواح الأحادية الحديثة إلى كفاءة ٢١-٢٥٪، وتلتقط التصاميم ثنائية الوجه الضوء المنعكس من الوجهين.",
          ),
        },
        {
          heading: t("Inverters make it usable", "العاكسات تجعلها قابلة للاستخدام"),
          body: t(
            "An inverter converts DC into the AC your home runs on. String inverters serve the whole array; microinverters optimise each panel — better for shaded or complex roofs.",
            "يحول العاكس التيار المستمر إلى التيار المتردد الذي يعمل به منزلك. تخدم عاكسات السلسلة المصفوفة كاملة؛ بينما تحسّن العاكسات الدقيقة كل لوح على حدة.",
          ),
        },
        {
          heading: t("Batteries keep the night on", "البطاريات تنير الليل"),
          body: t(
            "Lithium iron phosphate storage banks excess daytime energy. Sized correctly, a battery carries your critical loads through outages and evenings without the grid.",
            "تخزن بطاريات فوسفات حديد الليثيوم فائض طاقة النهار. عند اختيار الحجم الصحيح، تغطي البطارية أحمالك الأساسية خلال الانقطاعات والأمسيات دون الشبكة.",
          ),
        },
        {
          heading: t("Sizing your system", "تحديد حجم نظامك"),
          body: t(
            "Start from your monthly kWh bill. A 5 kW array in a sunny climate yields roughly 650–800 kWh per month. Our advisors run free load calculations before you order.",
            "ابدأ من فاتورتك الشهرية بالكيلوواط ساعة. تنتج مصفوفة ٥ كيلوواط في مناخ مشمس حوالي ٦٥٠-٨٠٠ كيلوواط ساعة شهرياً. يجري مستشارونا حسابات الأحمال مجاناً قبل طلبك.",
          ),
        },
      ]}
    />
  );
};

export default SolarEducation;
