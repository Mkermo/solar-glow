import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { useCategories, useProducts, useTestimonials } from "@/api/queries";
import Marquee from "@/components/decor/Marquee";
import ScrollReveal from "@/components/decor/ScrollReveal";
import SectionHeading, { SectionTitle } from "@/components/decor/SectionHeading";
import SunDial from "@/components/decor/SunDial";
import ProductCard from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { editorialIndex } from "@/lib/format";

const heroStats = [
  { value: "25.5%", label: "Peak cell efficiency" },
  { value: "35 yr", label: "Maximum warranty" },
  { value: "1.2 GW", label: "Capacity shipped" },
  { value: "04", label: "Product lines" },
];

const manifesto = [
  {
    title: "Engineered, not assembled",
    body: "Every panel, inverter and battery is sourced from tier-one manufacturers and re-tested in our own lab before it earns a page in this catalogue.",
  },
  {
    title: "Specified like print",
    body: "Numbers you can hold us to. Full spec sheets, real efficiency curves, honest warranties — typeset clearly, with nothing hidden in footnotes.",
  },
  {
    title: "Supported for decades",
    body: "Solar is a 30-year decision. Our advisors stay with you from the first roof survey to the last warranty claim.",
  },
];

const Home = () => {
  const { t } = useLanguage();
  const { data: featured, isLoading: loadingFeatured } = useProducts({ featured: true });
  const { data: categories } = useCategories();
  const { data: testimonials } = useTestimonials();

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-paper">
        {/* glow orbs */}
        <div aria-hidden className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-solar/15 blur-3xl" />
        <div aria-hidden className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-solar-ember/10 blur-3xl" />

        <div className="container relative grid min-h-[88vh] items-center gap-12 py-20 lg:grid-cols-[3fr,2fr]">
          <div className="space-y-10">
            <ScrollReveal direction="none">
              <p className="kicker flex items-center gap-3 text-solar">
                <span aria-hidden>✦</span> {t("Vol. 01 — The Solar Catalogue", "المجلد ٠١ — كتالوج الطاقة الشمسية")}
              </p>
            </ScrollReveal>

            <h1 className="font-serif text-display-xl">
              <ScrollReveal delay={0.05}>
                <span className="block">{t("Power", "طاقة")}</span>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <span className="block italic text-gloss">{t("from the", "من")}</span>
              </ScrollReveal>
              <ScrollReveal delay={0.25}>
                <span className="block text-outline text-paper">{t("Sun.", "الشمس.")}</span>
              </ScrollReveal>
            </h1>

            <ScrollReveal delay={0.35}>
              <p className="max-w-md text-base leading-relaxed text-paper/65">
                {t(
                  "Premium panels, inverters and storage — curated like a print catalogue, engineered for the next century of sunlight.",
                  "ألواح وعاكسات وبطاريات فاخرة — منسقة ككتالوج مطبوع، ومصممة لقرن قادم من ضوء الشمس.",
                )}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.45}>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/products"
                  className="shine group inline-flex items-center gap-3 bg-solar px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-solar-glow"
                >
                  {t("Browse the catalogue", "تصفح الكتالوج")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/contact"
                  className="kicker inline-flex items-center gap-2 border-b border-paper/30 pb-1 text-paper/80 transition-colors hover:border-solar hover:text-solar"
                >
                  {t("Get a quote", "احصل على عرض سعر")}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="left" delay={0.3} className="hidden lg:block">
            <SunDial className="mx-auto w-full max-w-md animate-float text-paper" />
          </ScrollReveal>
        </div>

        {/* hero stats strip */}
        <div className="relative border-t border-white/10">
          <div className="container grid grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
            {heroStats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.08} className="px-6 py-6">
                <p className="font-mono text-2xl font-bold text-solar">{stat.value}</p>
                <p className="kicker mt-1 text-[0.6rem] text-paper/50">{stat.label}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gold ticker ──────────────────────────────────────────────────── */}
      <Marquee
        className="kicker border-y border-ink bg-solar py-4 text-ink"
        items={[
          t("Solar Panels", "الألواح الشمسية"),
          t("Inverters", "العاكسات"),
          t("Batteries", "البطاريات"),
          t("Accessories", "الإكسسوارات"),
          t("Free shipping over $1,000", "شحن مجاني فوق ١٠٠٠ دولار"),
        ]}
      />

      {/* ── Chapter 01 — Categories index ───────────────────────────────── */}
      <section className="container py-24">
        <SectionHeading index="01" kicker={t("The Collections", "المجموعات")} />
        <SectionTitle>
          {t("Four ways to", "أربع طرق")}{" "}
          <em className="text-solar-deep">{t("own the sun", "لامتلاك الشمس")}</em>
        </SectionTitle>

        <div className="mt-14">
          {(categories?.data ?? []).map((category, i) => (
            <ScrollReveal key={category.id} delay={i * 0.06}>
              <Link
                to={`/products?category=${category.slug}`}
                className="group grid grid-cols-[auto,1fr,auto] items-baseline gap-6 border-t border-ink/15 py-8 transition-colors last:border-b hover:bg-paper-soft md:gap-12"
              >
                <span className="font-mono text-sm text-muted-foreground">
                  {editorialIndex(i)}
                </span>
                <div>
                  <h3 className="font-serif text-3xl transition-transform duration-300 group-hover:translate-x-2 md:text-5xl">
                    {t(category.name, category.name_ar)}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <span className="flex items-center gap-3">
                  <span className="kicker hidden text-muted-foreground sm:block">
                    {category.products_count} {t("items", "منتج")}
                  </span>
                  <ArrowDownRight className="h-6 w-6 transition-transform duration-300 group-hover:-rotate-90 group-hover:text-solar-deep" />
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Chapter 02 — Featured products ──────────────────────────────── */}
      <section className="bg-ink py-24 text-paper">
        <div className="container">
          <SectionHeading index="02" kicker={t("Selected Works", "مختارات")} dark />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle className="text-paper">
              {t("Featured", "منتجات")}{" "}
              <em className="text-gloss">{t("hardware", "مميزة")}</em>
            </SectionTitle>
            <ScrollReveal delay={0.15}>
              <Link
                to="/products"
                className="kicker inline-flex items-center gap-2 border-b border-paper/30 pb-1 text-paper/70 transition-colors hover:border-solar hover:text-solar"
              >
                {t("Full catalogue", "الكتالوج الكامل")}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </ScrollReveal>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loadingFeatured
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] bg-white/5" />
                ))
              : (featured?.data ?? []).slice(0, 6).map((product, i) => (
                  <ScrollReveal key={product.id} delay={(i % 3) * 0.08}>
                    <ProductCard product={product} />
                  </ScrollReveal>
                ))}
          </div>
        </div>
      </section>

      {/* ── Chapter 03 — Manifesto ──────────────────────────────────────── */}
      <section className="container py-24">
        <SectionHeading index="03" kicker={t("The Standard", "المعيار")} />
        <div className="grid gap-12 lg:grid-cols-[2fr,3fr]">
          <SectionTitle>
            {t("Why", "لماذا")} <em className="text-solar-deep">Solar Glow</em>
          </SectionTitle>

          <div className="mt-6 space-y-0 lg:mt-20">
            {manifesto.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.08}>
                <div className="grid gap-4 border-t border-ink/15 py-8 last:border-b md:grid-cols-[auto,1fr] md:gap-10">
                  <span className="font-serif text-5xl italic text-solar-deep">
                    {editorialIndex(i)}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl">{item.title}</h3>
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chapter 04 — Testimonials ───────────────────────────────────── */}
      {(testimonials?.data?.length ?? 0) > 0 && (
        <section className="bg-paper-soft py-24">
          <div className="container">
            <SectionHeading index="04" kicker={t("In Print", "آراء العملاء")} />
            <div className="mt-14 grid gap-px overflow-hidden border border-ink/15 bg-ink/15 md:grid-cols-3">
              {testimonials!.data.map((testimonial, i) => (
                <ScrollReveal key={testimonial.id} delay={i * 0.08} className="bg-paper">
                  <figure className="flex h-full flex-col justify-between p-8">
                    <div>
                      <div className="flex gap-1 text-solar-deep">
                        {Array.from({ length: testimonial.rating }).map((_, s) => (
                          <Star key={s} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <blockquote className="mt-6 font-serif text-xl italic leading-relaxed">
                        “{testimonial.quote}”
                      </blockquote>
                    </div>
                    <figcaption className="mt-8 border-t border-ink/10 pt-4">
                      <p className="font-mono text-sm font-bold">{testimonial.author}</p>
                      <p className="kicker mt-1 text-[0.6rem] text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </figcaption>
                  </figure>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Finale CTA ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink py-28 text-paper">
        <div aria-hidden className="absolute left-1/2 top-1/2 h-[120%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.07]">
          <SunDial className="h-full text-paper" />
        </div>
        <div className="container relative text-center">
          <ScrollReveal>
            <p className="kicker text-solar">{t("Final Page", "الصفحة الأخيرة")}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="mx-auto mt-6 max-w-4xl font-serif text-display-lg">
              {t("Ready to switch", "مستعد للتحول")}{" "}
              <em className="text-gloss">{t("to the sun?", "إلى الشمس؟")}</em>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              to="/products"
              className="shine mt-12 inline-flex items-center gap-3 bg-solar px-10 py-5 font-mono text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-solar-glow"
            >
              {t("Start your system", "ابدأ نظامك")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
