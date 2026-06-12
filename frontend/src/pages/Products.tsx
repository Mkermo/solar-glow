import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useCategories, useProducts } from "@/api/queries";
import PageHeader from "@/components/layout/PageHeader";
import ScrollReveal from "@/components/decor/ScrollReveal";
import ProductCard from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const Products = () => {
  const { t } = useLanguage();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  // Category can arrive via /products/:category (legacy links) or ?category=
  const activeCategory = params.category ?? searchParams.get("category") ?? "";

  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({
    category: activeCategory && activeCategory !== "all" ? activeCategory : undefined,
    search: search || undefined,
  });

  const activeName = useMemo(() => {
    const match = categories?.data.find((c) => c.slug === activeCategory);
    return match ? t(match.name, match.name_ar) : t("Everything", "كل المنتجات");
  }, [categories, activeCategory, t]);

  const selectCategory = (slug: string) => {
    setSearchParams(slug ? { category: slug } : {});
  };

  return (
    <div>
      <PageHeader
        kicker={t("The Catalogue", "الكتالوج")}
        title={
          <>
            {t("Browse", "تصفح")} <em className="text-gloss">{activeName}</em>
          </>
        }
        intro={t(
          "Every item is lab-verified and typeset with its full specification. No footnotes, no surprises.",
          "كل منتج تم التحقق منه مخبرياً مع مواصفاته الكاملة. لا هوامش، لا مفاجآت.",
        )}
      />

      <section className="container py-16">
        {/* filter rail */}
        <ScrollReveal direction="none">
          <div className="flex flex-wrap items-center gap-3 border-b border-ink/15 pb-6">
            <button
              onClick={() => selectCategory("")}
              className={cn(
                "kicker border px-4 py-2 transition-colors",
                !activeCategory
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/20 hover:border-ink",
              )}
            >
              {t("All", "الكل")}
            </button>
            {(categories?.data ?? []).map((category) => (
              <button
                key={category.id}
                onClick={() => selectCategory(category.slug)}
                className={cn(
                  "kicker border px-4 py-2 transition-colors",
                  activeCategory === category.slug
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/20 hover:border-ink",
                )}
              >
                {t(category.name, category.name_ar)}
              </button>
            ))}

            <label className="relative ml-auto flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search the catalogue…", "ابحث في الكتالوج…")}
                className="border border-ink/20 bg-transparent py-2 pl-10 pr-4 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ink"
              />
            </label>
          </div>
        </ScrollReveal>

        {/* results */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] bg-ink/10" />
              ))
            : (products?.data ?? []).map((product, i) => (
                <ScrollReveal key={product.id} delay={(i % 4) * 0.06}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
        </div>

        {!isLoading && (products?.data.length ?? 0) === 0 && (
          <div className="py-24 text-center">
            <p className="font-serif text-3xl italic">{t("Nothing in print yet.", "لا يوجد شيء بعد.")}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("Try a different search or category.", "جرب بحثاً أو فئة مختلفة.")}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Products;
