import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import ScrollReveal from "@/components/decor/ScrollReveal";
import ProductVisual from "@/components/product/ProductVisual";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 1000;

const Cart = () => {
  const { t } = useLanguage();
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <div>
      <PageHeader
        kicker={t("Your Selection", "اختيارك")}
        title={
          <>
            {t("The", "سلة")} <em className="text-gloss">{t("Cart", "التسوق")}</em>
          </>
        }
      />

      <section className="container py-16">
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-display-md italic">{t("Empty pages.", "صفحات فارغة.")}</p>
            <p className="mt-4 text-muted-foreground">
              {t("Your cart has no entries yet.", "سلتك لا تحتوي على أي منتجات بعد.")}
            </p>
            <Link
              to="/products"
              className="shine mt-10 inline-flex items-center gap-3 bg-ink px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-paper transition-colors hover:bg-solar hover:text-ink"
            >
              {t("Browse the catalogue", "تصفح الكتالوج")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[2fr,1fr]">
            <div>
              {items.map((item, i) => (
                <ScrollReveal key={item.product.id} delay={i * 0.05}>
                  <div className="grid grid-cols-[80px,1fr,auto] items-center gap-5 border-t border-ink/15 py-6 last:border-b sm:grid-cols-[110px,1fr,auto]">
                    <ProductVisual product={item.product} className="aspect-square border border-ink/10" />

                    <div>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-serif text-lg leading-tight transition-colors hover:text-solar-deep sm:text-xl"
                      >
                        {t(item.product.name, item.product.name_ar)}
                      </Link>
                      <p className="mt-1 font-mono text-sm text-muted-foreground">
                        {formatCurrency(item.product.effective_price)}
                      </p>

                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center border border-ink/20">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2.5 py-2 transition-colors hover:bg-ink hover:text-paper"
                            aria-label={t("Decrease", "تقليل")}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center font-mono text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2.5 py-2 transition-colors hover:bg-ink hover:text-paper"
                            aria-label={t("Increase", "زيادة")}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={t("Remove", "إزالة")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <span className="font-mono font-bold">
                      {formatCurrency(item.product.effective_price * item.quantity)}
                    </span>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* summary */}
            <ScrollReveal direction="left">
              <aside className="glass-paper sticky top-24 space-y-5 border border-ink/15 p-8">
                <p className="kicker border-b border-ink/15 pb-4 text-solar-deep">
                  {t("Order summary", "ملخص الطلب")}
                </p>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("Subtotal", "المجموع الفرعي")}</span>
                  <span className="font-mono font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("Shipping", "الشحن")}</span>
                  <span className="font-mono">
                    {subtotal >= FREE_SHIPPING_THRESHOLD
                      ? t("Free", "مجاني")
                      : t("Calculated at checkout", "يحسب عند الدفع")}
                  </span>
                </div>

                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="border border-solar/40 bg-solar/10 p-3 text-xs leading-relaxed">
                    {t(
                      `Add ${formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.`,
                      `أضف ${formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} للحصول على شحن مجاني.`,
                    )}
                  </p>
                )}

                <Link
                  to="/checkout"
                  className="shine inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-paper transition-colors hover:bg-solar hover:text-ink"
                >
                  {t("Checkout", "إتمام الطلب")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </aside>
            </ScrollReveal>
          </div>
        )}
      </section>
    </div>
  );
};

export default Cart;
