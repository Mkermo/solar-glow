import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import ScrollReveal from "@/components/decor/ScrollReveal";
import SectionHeading from "@/components/decor/SectionHeading";
import SunDial from "@/components/decor/SunDial";
import { useLanguage } from "@/contexts/LanguageContext";
import { editorialIndex } from "@/lib/format";

const About = () => {
  const { t } = useLanguage();

  const principles = [
    {
      title: t("Curation over inventory", "الانتقاء قبل التخزين"),
      body: t(
        "We stock four product lines, not four hundred. Every item earns its page through lab testing and field performance.",
        "نخزن أربعة خطوط إنتاج، وليس أربعمئة. كل منتج يستحق صفحته عبر اختبارات المختبر والأداء الميداني.",
      ),
    },
    {
      title: t("Specification as contract", "المواصفات عقد"),
      body: t(
        "The numbers printed in this catalogue are the numbers you receive. We re-test samples from every shipment.",
        "الأرقام المطبوعة في هذا الكتالوج هي الأرقام التي تحصل عليها. نعيد اختبار عينات من كل شحنة.",
      ),
    },
    {
      title: t("Decades, not seasons", "عقود، وليست مواسم"),
      body: t(
        "Solar hardware should outlive its installer's van. We choose products warranted for 20–35 years and stand behind every claim.",
        "يجب أن تدوم أجهزة الطاقة الشمسية لعقود. نختار منتجات بضمان ٢٠-٣٥ سنة ونقف خلف كل مطالبة.",
      ),
    },
  ];

  const stats = [
    { value: "2019", label: t("Founded", "التأسيس") },
    { value: "12k+", label: t("Systems delivered", "نظام تم توصيله") },
    { value: "98.2%", label: t("Satisfaction", "رضا العملاء") },
    { value: "35 yr", label: t("Longest warranty", "أطول ضمان") },
  ];

  return (
    <div>
      <PageHeader
        kicker={t("The Masthead", "من نحن")}
        title={
          <>
            {t("We publish", "نحن ننشر")} <em className="text-gloss">{t("sunlight.", "ضوء الشمس.")}</em>
          </>
        }
        intro={t(
          "Solar Glow is a solar hardware house run like an editorial desk: curated products, verified numbers, honest print.",
          "سولار جلو هي دار أجهزة شمسية تُدار كمكتب تحرير: منتجات منتقاة، أرقام موثقة، طباعة صادقة.",
        )}
      />

      {/* stats band */}
      <section className="border-b border-ink/15">
        <div className="container grid grid-cols-2 divide-x divide-ink/15 md:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.07} className="px-6 py-8">
              <p className="font-mono text-3xl font-bold text-solar-deep">{stat.value}</p>
              <p className="kicker mt-2 text-[0.6rem] text-muted-foreground">{stat.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* principles */}
      <section className="container py-24">
        <SectionHeading index="01" kicker={t("Editorial Principles", "مبادئ التحرير")} />
        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr,2fr]">
          <ScrollReveal direction="right" className="hidden lg:block">
            <SunDial className="sticky top-32 w-full max-w-xs text-ink" />
          </ScrollReveal>

          <div>
            {principles.map((principle, i) => (
              <ScrollReveal key={principle.title} delay={i * 0.08}>
                <div className="grid gap-4 border-t border-ink/15 py-10 last:border-b md:grid-cols-[auto,1fr] md:gap-10">
                  <span className="font-serif text-6xl italic text-solar-deep">
                    {editorialIndex(i)}
                  </span>
                  <div>
                    <h2 className="font-serif text-3xl">{principle.title}</h2>
                    <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                      {principle.body}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-24 text-paper">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="mx-auto max-w-3xl font-serif text-display-md">
              {t("Read the catalogue. Keep the sun.", "اقرأ الكتالوج. واحتفظ بالشمس.")}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <Link
              to="/products"
              className="shine mt-10 inline-flex items-center gap-3 bg-solar px-10 py-5 font-mono text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-solar-glow"
            >
              {t("Open the catalogue", "افتح الكتالوج")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default About;
