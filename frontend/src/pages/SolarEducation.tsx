import { Link } from "react-router-dom";
import { ArrowRight, Calculator as CalcIcon } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import ScrollReveal from "@/components/decor/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { editorialIndex } from "@/lib/format";

interface Chapter {
  title: string;
  title_ar: string;
  body: string[];
  list?: string[];
}

const SolarEducation = () => {
  const { t } = useLanguage();

  // Long-form English body, with Arabic chapter titles. A full Arabic
  // translation of the body is a planned follow-up.
  const chapters: Chapter[] = [
    {
      title: "How a solar system actually works",
      title_ar: "كيف يعمل النظام الشمسي فعلياً",
      body: [
        "Sunlight hits the panels and is turned into DC electricity. A charge controller feeds that into a battery, and an inverter converts the stored DC into the AC your home uses. With grid power available, the inverter can also pass mains through and charge the battery; when the grid is down, your battery and panels carry the house.",
        "Four parts, in order: panels (generate) → charge controller (protect & optimise) → battery (store) → inverter (deliver). Get the sizing of each right and the system simply works in the background.",
      ],
    },
    {
      title: "Know what you consume",
      title_ar: "اعرف استهلاكك",
      body: [
        "Every appliance has a wattage on its label or rating plate. Energy is watts multiplied by the hours you run it: a 150W fridge running an effective 8 hours a day uses 1,200 watt-hours (1.2 kWh). Add up every device for one day and you have your daily energy need — the single most important number in the whole design.",
        "You don't have to do this by hand. Our calculator adds it up for you and turns it straight into panel, battery and inverter sizes.",
      ],
    },
    {
      title: "Sizing panels, battery and inverter",
      title_ar: "حساب الألواح والبطارية والعاكس",
      body: [
        "Three independent calculations, each answering a different question:",
      ],
      list: [
        "Panels answer “how do I refill the battery?” — daily energy ÷ peak sun hours, then add ~25% for real-world losses (dust, heat, wiring). In Gaza, plan around 5 peak sun hours.",
        "Battery answers “how long do I last with no sun or grid?” — daily energy × backup days ÷ usable depth of discharge. Lithium gives you ~90% of its capacity; lead-acid only ~50%.",
        "Inverter answers “can I run everything at once?” — it must cover your peak simultaneous load, not your daily total, with headroom for motor start-up surges (fridge, pump).",
      ],
    },
    {
      title: "MPPT or PWM — which charge controller?",
      title_ar: "MPPT أم PWM — أي منظم شحن؟",
      body: [
        "The charge controller sits between panels and battery. PWM is cheaper but wastes power when the panel voltage is higher than the battery — fine for very small setups. MPPT actively tracks the panel's best operating point and harvests 15–30% more energy, especially in cold or low light, and lets you wire panels in higher-voltage strings.",
        "For anything beyond a single small panel — and certainly for a home backup system — choose MPPT. The extra harvest pays for itself quickly.",
      ],
    },
    {
      title: "Battery health and care",
      title_ar: "صحة البطارية والعناية بها",
      body: [
        "A battery's life is measured in cycles — one charge-and-discharge each. Lithium (LFP) lasts 4,000–8,000 cycles; lead-acid far fewer. Two things kill batteries early: discharging them too deeply too often, and heat.",
        "Signs a battery is fading: it charges full but empties much faster than it used to, runs hot, or its voltage sags hard the moment you switch on a load. Keep batteries cool and shaded, avoid draining lithium below ~10–20%, and never mix old and new cells in the same bank.",
      ],
    },
    {
      title: "Used or damaged panels — what's safe",
      title_ar: "الألواح المستعملة أو التالفة — ما الآمن",
      body: [
        "Across Gaza, an estimated 65% of panels were damaged by 2024 and many people rebuild systems from salvaged parts. A panel can still be useful with cosmetic scratches, but treat these as warnings: a cracked glass front, a burnt or bubbled backsheet, scorched junction box, or visible 'snail trails' and shattered cells.",
        "A cracked panel often still produces power, but at reduced output, and it can let moisture in — risking corrosion, hot spots and, with a damaged backsheet, electric shock when wet. Test a used panel's open-circuit voltage in sun, inspect the back, and keep damaged panels out of reach and properly earthed. If the glass is shattered or the backsheet is breached, retire it.",
      ],
    },
    {
      title: "Stretch your system — saving power",
      title_ar: "وفّر الطاقة — أطل عمر نظامك",
      body: [
        "The cheapest kilowatt-hour is the one you never use. Small habits dramatically shrink the system you need:",
      ],
      list: [
        "Switch all lighting to LED — a tenth of the power of old bulbs.",
        "Run heavy loads (washing, pumping, ironing) during peak sun, straight off the panels, not the battery at night.",
        "Choose an inverter-type / high-efficiency fridge; it's the biggest always-on load in most homes.",
        "Kill standby power — TVs, chargers and routers draw current even when 'off'. Use switched sockets.",
        "Keep panels clean and unshaded; even one shaded cell drags down a whole string.",
      ],
    },
    {
      title: "Setup and safety",
      title_ar: "التركيب والسلامة",
      body: [
        "Mount panels facing the sun with no shading, tilted roughly to your latitude, and on flat Gaza rooftops a simple angled frame works well. Keep DC cable runs short and correctly sized, fuse every battery, and fit a DC disconnect so you can isolate the array.",
        "This is real electricity — DC arcs don't self-extinguish like AC, and lithium batteries can be dangerous if short-circuited or crushed. Plan and learn the design yourself, but have the final connections checked or made by a qualified installer. When in doubt, ask in the community before you wire it.",
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        kicker={t("Field Guide", "الدليل الميداني")}
        title={
          <>
            {t("Solar,", "الطاقة الشمسية،")} <em className="text-gloss">{t("explained", "ببساطة")}</em>
          </>
        }
        intro={t(
          "From photon to socket — how to measure what you use, size a system, judge used gear, and make it last. Written for real conditions, not showroom ones.",
          "من الفوتون إلى المقبس — كيف تقيس استهلاكك، تحسب نظامك، تقيّم الأجهزة المستعملة، وتطيل عمرها. مكتوب لظروف حقيقية.",
        )}
      />

      {/* calculator CTA */}
      <section className="border-b border-ink/15 bg-paper-soft">
        <div className="container flex flex-col items-start justify-between gap-5 py-10 sm:flex-row sm:items-center">
          <p className="flex items-center gap-3 font-serif text-2xl">
            <CalcIcon className="h-6 w-6 text-solar-deep" />
            {t("Prefer numbers first? Run the calculator.", "تفضّل الأرقام أولاً؟ جرّب الحاسبة.")}
          </p>
          <Link
            to="/calculator"
            className="shine inline-flex items-center gap-3 bg-solar px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-solar-glow"
          >
            {t("Open the calculator", "افتح الحاسبة")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="container max-w-4xl py-16">
        {chapters.map((chapter, i) => (
          <ScrollReveal key={chapter.title} delay={(i % 3) * 0.05}>
            <article className="grid gap-4 border-t border-ink/15 py-12 last:border-b md:grid-cols-[auto,1fr] md:gap-10">
              <span className="font-serif text-5xl italic text-solar-deep">{editorialIndex(i)}</span>
              <div className="space-y-4">
                <h2 className="font-serif text-3xl">{t(chapter.title, chapter.title_ar)}</h2>
                {chapter.body.map((paragraph, p) => (
                  <p key={p} className="leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
                {chapter.list && (
                  <ul className="space-y-3 pt-2">
                    {chapter.list.map((entry, l) => (
                      <li key={l} className="flex gap-3 text-muted-foreground">
                        <span aria-hidden className="mt-1 shrink-0 text-solar-deep">
                          ✦
                        </span>
                        <span className="leading-relaxed">{entry}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          </ScrollReveal>
        ))}
      </section>

      {/* closing CTA */}
      <section className="bg-ink py-20 text-paper">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="mx-auto max-w-3xl font-serif text-display-md">
              {t("Have a question we didn't cover?", "لديك سؤال لم نغطّه؟")}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mx-auto mt-4 max-w-lg text-paper/60">
              {t(
                "Reach the team directly — roof surveys, sizing help, or used-gear advice.",
                "تواصل مع الفريق مباشرة — معاينة الأسطح، المساعدة في الحساب، أو نصائح الأجهزة المستعملة.",
              )}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              to="/contact"
              className="shine mt-10 inline-flex items-center gap-3 bg-solar px-10 py-5 font-mono text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-solar-glow"
            >
              {t("Ask the team", "اسأل الفريق")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default SolarEducation;
