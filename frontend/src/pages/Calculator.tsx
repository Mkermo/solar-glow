import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BatteryCharging, Gauge, Minus, Plus, Sun, Zap } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import ScrollReveal from "@/components/decor/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  APPLIANCE_PRESETS,
  BATTERY_SPECS,
  GAZA_DEFAULTS,
  loadDailyWh,
  sizeSystem,
  type BatteryChemistry,
  type LoadItem,
} from "@/lib/solar";
import { cn } from "@/lib/utils";

// Start with a realistic Gaza essentials load so results are visible immediately.
const DEFAULT_SELECTION = ["led", "phone", "router", "fridge"];

const Calculator = () => {
  const { t, lang } = useLanguage();

  const [loads, setLoads] = useState<LoadItem[]>(() =>
    APPLIANCE_PRESETS.filter((a) => DEFAULT_SELECTION.includes(a.id)).map((appliance) => ({
      appliance,
      quantity: 1,
      watts: appliance.watts,
      hoursPerDay: appliance.defaultHours,
    })),
  );
  const [peakSunHours, setPeakSunHours] = useState<number>(GAZA_DEFAULTS.peakSunHours);
  const [autonomyDays, setAutonomyDays] = useState<number>(GAZA_DEFAULTS.autonomyDays);
  const [panelWatts, setPanelWatts] = useState<number>(GAZA_DEFAULTS.panelWatts);
  const [battery, setBattery] = useState<BatteryChemistry>("lithium");

  const result = useMemo(
    () => sizeSystem({ loads, peakSunHours, autonomyDays, panelWatts, battery }),
    [loads, peakSunHours, autonomyDays, panelWatts, battery],
  );

  const isSelected = (id: string) => loads.some((l) => l.appliance.id === id);

  const toggleAppliance = (id: string) => {
    const appliance = APPLIANCE_PRESETS.find((a) => a.id === id)!;
    setLoads((prev) =>
      isSelected(id)
        ? prev.filter((l) => l.appliance.id !== id)
        : [
            ...prev,
            { appliance, watts: appliance.watts, quantity: 1, hoursPerDay: appliance.defaultHours },
          ],
    );
  };

  const patchLoad = (id: string, patch: Partial<LoadItem>) =>
    setLoads((prev) => prev.map((l) => (l.appliance.id === id ? { ...l, ...patch } : l)));

  const removeLoad = (id: string) =>
    setLoads((prev) => prev.filter((l) => l.appliance.id !== id));

  // Dropping quantity to 0 deselects the appliance entirely.
  const setQuantity = (id: string, quantity: number) =>
    quantity <= 0 ? removeLoad(id) : patchLoad(id, { quantity });

  const results = [
    {
      icon: Sun,
      value: result.panelCount,
      unit: t(`× ${panelWatts}W panels`, `لوح × ${panelWatts}واط`),
      label: t("Solar array", "المصفوفة الشمسية"),
      hint: t(
        `About ${result.arrayW.toLocaleString()}W of panels to refill the battery in one sunny day.`,
        `حوالي ${result.arrayW.toLocaleString()} واط من الألواح لإعادة شحن البطارية في يوم مشمس.`,
      ),
      to: "/products?category=panels",
    },
    {
      icon: BatteryCharging,
      value: result.batteryKwh,
      unit: "kWh",
      label: t("Battery storage", "تخزين البطارية"),
      hint: t(
        `Carries your loads for ${autonomyDays} day(s) with no sun or grid (${BATTERY_SPECS[battery].label}).`,
        `يشغّل أحمالك لمدة ${autonomyDays} يوم دون شمس أو شبكة (${BATTERY_SPECS[battery].label}).`,
      ),
      to: "/products?category=batteries",
    },
    {
      icon: Gauge,
      value: result.inverterKw,
      unit: "kW",
      label: t("Inverter size", "حجم العاكس"),
      hint: t(
        `Handles your ${result.peakLoadW.toLocaleString()}W peak with surge headroom.`,
        `يتحمل ذروة ${result.peakLoadW.toLocaleString()} واط مع هامش للاندفاع.`,
      ),
      to: "/products?category=inverters",
    },
    {
      icon: Zap,
      value: result.dailyWh.toLocaleString(),
      unit: "Wh/day",
      label: t("Daily energy", "الطاقة اليومية"),
      hint: t(`≈ ${result.monthlyKwh} kWh per month.`, `≈ ${result.monthlyKwh} كيلوواط ساعة شهرياً.`),
    },
  ];

  return (
    <div>
      <PageHeader
        kicker={t("Field Tool", "أداة ميدانية")}
        title={
          <>
            {t("Size your", "احسب")} <em className="text-gloss">{t("solar system", "نظامك الشمسي")}</em>
          </>
        }
        intro={t(
          "Pick what you run, set the hours, and get an honest panel / battery / inverter estimate — tuned for Gaza's sun and long grid outages.",
          "اختر ما تشغّله، حدد الساعات، واحصل على تقدير صادق للألواح والبطارية والعاكس — مضبوط لشمس غزة وانقطاعات الكهرباء الطويلة.",
        )}
      />

      <section className="container grid gap-12 py-16 lg:grid-cols-[3fr,2fr]">
        {/* ── Load builder ─────────────────────────────────────────────── */}
        <div>
          <ScrollReveal direction="none">
            <p className="kicker border-b border-ink/15 pb-4 text-solar-deep">
              № 01 — {t("What do you run?", "ماذا تشغّل؟")}
            </p>
          </ScrollReveal>

          {/* appliance chips */}
          <ScrollReveal delay={0.05}>
            <div className="flex flex-wrap gap-2 py-6">
              {APPLIANCE_PRESETS.map((appliance) => (
                <button
                  key={appliance.id}
                  onClick={() => toggleAppliance(appliance.id)}
                  className={cn(
                    "kicker border px-3 py-2 transition-colors",
                    isSelected(appliance.id)
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/20 hover:border-ink",
                  )}
                >
                  {t(appliance.name, appliance.name_ar)}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* selected loads */}
          <div>
            {loads.length === 0 && (
              <p className="border border-ink/15 bg-paper-soft p-6 text-center text-sm text-muted-foreground">
                {t("Select an appliance above to begin.", "اختر جهازاً أعلاه للبدء.")}
              </p>
            )}

            {loads.map((item, i) => (
              <ScrollReveal key={item.appliance.id} delay={i * 0.03}>
                <div className="grid grid-cols-[1fr,auto,auto,auto] items-center gap-4 border-t border-ink/15 py-4 last:border-b">
                  <div>
                    <p className="font-serif text-lg">{t(item.appliance.name, item.appliance.name_ar)}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {loadDailyWh(item).toLocaleString()} Wh/{t("day", "يوم")}
                    </p>
                  </div>

                  {/* editable wattage */}
                  <label className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={item.watts}
                      onChange={(e) =>
                        patchLoad(item.appliance.id, { watts: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-20 border border-ink/20 bg-transparent px-2 py-2 text-center font-mono text-sm outline-none focus:border-ink"
                      aria-label={t("Watts", "واط")}
                    />
                    <span className="kicker text-[0.55rem] text-muted-foreground">W</span>
                  </label>

                  {/* quantity — 0 removes the appliance */}
                  <div className="flex items-center border border-ink/20">
                    <button
                      onClick={() => setQuantity(item.appliance.id, item.quantity - 1)}
                      className="px-2.5 py-2 transition-colors hover:bg-ink hover:text-paper"
                      aria-label={t("Less", "أقل")}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-9 text-center font-mono text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.appliance.id, item.quantity + 1)}
                      className="px-2.5 py-2 transition-colors hover:bg-ink hover:text-paper"
                      aria-label={t("More", "أكثر")}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* hours per day */}
                  <label className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={item.hoursPerDay}
                      onChange={(e) =>
                        patchLoad(item.appliance.id, {
                          hoursPerDay: Math.min(24, Math.max(0, Number(e.target.value))),
                        })
                      }
                      className="w-16 border border-ink/20 bg-transparent px-2 py-2 text-center font-mono text-sm outline-none focus:border-ink"
                    />
                    <span className="kicker text-[0.55rem] text-muted-foreground">{t("hrs", "ساعة")}</span>
                  </label>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* assumptions */}
          <ScrollReveal>
            <p className="kicker mt-12 border-b border-ink/15 pb-4 text-solar-deep">
              № 02 — {t("Your conditions", "ظروفك")}
            </p>
          </ScrollReveal>

          <div className="grid gap-6 py-6 sm:grid-cols-2">
            <label className="block">
              <span className="kicker text-[0.6rem] text-muted-foreground">
                {t("Peak sun hours / day", "ساعات الشمس الذروة / يوم")}
              </span>
              <input
                type="number"
                min={1}
                max={8}
                step={0.5}
                value={peakSunHours}
                onChange={(e) => setPeakSunHours(Number(e.target.value))}
                className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 font-mono outline-none focus:border-solar-deep"
              />
              <span className="mt-1 block text-xs text-muted-foreground">{t("Gaza ≈ 5", "غزة ≈ 5")}</span>
            </label>

            <label className="block">
              <span className="kicker text-[0.6rem] text-muted-foreground">
                {t("Backup days (no sun)", "أيام الاحتياطي (دون شمس)")}
              </span>
              <input
                type="number"
                min={0.5}
                max={5}
                step={0.5}
                value={autonomyDays}
                onChange={(e) => setAutonomyDays(Number(e.target.value))}
                className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 font-mono outline-none focus:border-solar-deep"
              />
            </label>

            <label className="block">
              <span className="kicker text-[0.6rem] text-muted-foreground">
                {t("Panel wattage", "قدرة اللوح")}
              </span>
              <select
                value={panelWatts}
                onChange={(e) => setPanelWatts(Number(e.target.value))}
                className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 font-mono outline-none focus:border-solar-deep"
              >
                {[300, 400, 500, 600].map((w) => (
                  <option key={w} value={w}>
                    {w}W
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="kicker text-[0.6rem] text-muted-foreground">
                {t("Battery type", "نوع البطارية")}
              </span>
              <select
                value={battery}
                onChange={(e) => setBattery(e.target.value as BatteryChemistry)}
                className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 font-mono outline-none focus:border-solar-deep"
              >
                <option value="lithium">{t("Lithium (LFP)", "ليثيوم (LFP)")}</option>
                <option value="lead-acid">{t("Lead-acid", "حمض الرصاص")}</option>
              </select>
            </label>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────────── */}
        <ScrollReveal direction="left">
          <aside className="sticky top-24 space-y-px overflow-hidden border border-ink bg-ink text-paper">
            <div className="bg-ink p-6">
              <p className="kicker text-solar">{t("Your estimate", "تقديرك")}</p>
            </div>
            {results.map((r) => (
              <div key={r.label} className="bg-ink-soft p-6">
                <div className="flex items-center justify-between">
                  <span className="kicker flex items-center gap-2 text-paper/60">
                    <r.icon className="h-4 w-4 text-solar" />
                    {r.label}
                  </span>
                  {r.to && (
                    <Link
                      to={r.to}
                      className="kicker inline-flex items-center gap-1 text-solar transition-colors hover:text-solar-glow"
                    >
                      {t("Shop", "تسوق")} <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                <p className="mt-3 font-mono text-4xl font-bold text-solar">
                  {r.value}
                  <span className="ml-2 text-sm font-normal text-paper/50">{r.unit}</span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-paper/55">{r.hint}</p>
              </div>
            ))}

            <div className="bg-ink p-6">
              <p className="text-[0.7rem] leading-relaxed text-paper/45" dir={lang === "ar" ? "rtl" : "ltr"}>
                {t(
                  "Estimates use a 0.75 system derate and surge headroom. Real installations vary — confirm with an installer before buying.",
                  "تستخدم التقديرات معامل ٠٫٧٥ للنظام وهامش اندفاع. التركيبات الفعلية تختلف — تأكد مع فني قبل الشراء.",
                )}
              </p>
            </div>
          </aside>
        </ScrollReveal>
      </section>

      {/* learn more */}
      <section className="border-t border-ink/15 bg-paper-soft py-16">
        <div className="container flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="max-w-xl font-serif text-2xl">
            {t(
              "Not sure what these numbers mean? Read the field guide.",
              "لست متأكداً من معنى هذه الأرقام؟ اقرأ الدليل الميداني.",
            )}
          </p>
          <Link
            to="/education"
            className="shine inline-flex items-center gap-3 bg-ink px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-paper transition-colors hover:bg-solar hover:text-ink"
          >
            {t("Learn solar", "تعلّم الطاقة الشمسية")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Calculator;
