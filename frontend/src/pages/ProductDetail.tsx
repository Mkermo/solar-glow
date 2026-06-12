import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useProduct } from "@/api/queries";
import ScrollReveal from "@/components/decor/ScrollReveal";
import ProductVisual from "@/components/product/ProductVisual";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/format";

const ProductDetail = () => {
  const { slug } = useParams();
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading, isError } = useProduct(slug);
  const product = data?.data;

  if (isLoading) {
    return (
      <div className="container grid gap-12 py-20 lg:grid-cols-2">
        <Skeleton className="aspect-square bg-ink/10" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 bg-ink/10" />
          <Skeleton className="h-32 w-full bg-ink/10" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container py-32 text-center">
        <p className="font-serif text-display-md italic">{t("Page missing.", "الصفحة مفقودة.")}</p>
        <Link to="/products" className="kicker mt-6 inline-block border-b border-ink pb-1">
          {t("Back to catalogue", "العودة للكتالوج")}
        </Link>
      </div>
    );
  }

  const specs =
    lang === "ar" && product.specifications_ar && Object.keys(product.specifications_ar).length > 0
      ? product.specifications_ar
      : product.specifications;

  const handleAdd = () => {
    addToCart(product, quantity);
    toast.success(t("Added to cart", "أضيف إلى السلة"), {
      description: `${quantity} × ${t(product.name, product.name_ar)}`,
    });
  };

  return (
    <div className="container py-12 md:py-20">
      <ScrollReveal direction="none">
        <Link
          to="/products"
          className="kicker inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("Catalogue", "الكتالوج")} / {product.category && t(product.category.name, product.category.name_ar)}
        </Link>
      </ScrollReveal>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-20">
        {/* large visual plate */}
        <ScrollReveal direction="right">
          <ProductVisual product={product} className="shine group aspect-square w-full border border-ink/15" />
        </ScrollReveal>

        <div>
          <ScrollReveal>
            <p className="kicker text-solar-deep">
              SG/{String(product.id).padStart(3, "0")} — {product.category && t(product.category.name, product.category.name_ar)}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <h1 className="mt-4 font-serif text-display-md">{t(product.name, product.name_ar)}</h1>
          </ScrollReveal>

          <ScrollReveal delay={0.16}>
            <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">
              {t(product.description ?? "", product.description_ar)}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.24}>
            <div className="mt-8 flex items-baseline gap-4 border-y border-ink/15 py-6">
              <span className="font-mono text-4xl font-bold">
                {formatCurrency(product.effective_price)}
              </span>
              {product.sale_price && (
                <span className="font-mono text-xl text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
              <span className="kicker ml-auto text-muted-foreground">
                {product.in_stock
                  ? `${product.stock_quantity} ${t("in stock", "متوفر")}`
                  : t("Sold out", "نفذ المخزون")}
              </span>
            </div>
          </ScrollReveal>

          {/* quantity + add */}
          <ScrollReveal delay={0.3}>
            <div className="mt-8 flex flex-wrap items-stretch gap-4">
              <div className="flex items-center border border-ink/20">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-4 transition-colors hover:bg-ink hover:text-paper"
                  aria-label={t("Decrease", "تقليل")}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-14 text-center font-mono font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  className="px-4 py-4 transition-colors hover:bg-ink hover:text-paper"
                  aria-label={t("Increase", "زيادة")}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={!product.in_stock}
                className="shine inline-flex flex-1 items-center justify-center gap-3 bg-ink px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-paper transition-colors hover:bg-solar hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag className="h-4 w-4" />
                {product.in_stock ? t("Add to cart", "أضف إلى السلة") : t("Sold out", "نفذ")}
              </button>
            </div>
          </ScrollReveal>

          {/* spec sheet */}
          {specs && Object.keys(specs).length > 0 && (
            <ScrollReveal delay={0.36}>
              <div className="mt-12">
                <p className="kicker border-t border-ink/15 pt-4 text-solar-deep">
                  {t("Specification sheet", "ورقة المواصفات")}
                </p>
                <dl className="mt-4">
                  {Object.entries(specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-2 gap-4 border-b border-ink/10 py-3 text-sm"
                    >
                      <dt className="font-mono uppercase tracking-wider text-muted-foreground">
                        {key}
                      </dt>
                      <dd className="text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
