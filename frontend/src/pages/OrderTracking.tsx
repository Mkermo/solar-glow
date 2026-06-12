import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleDashed, Search } from "lucide-react";
import { useOrderTracking } from "@/api/queries";
import PageHeader from "@/components/layout/PageHeader";
import ScrollReveal from "@/components/decor/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_SEQUENCE = ["pending", "confirmed", "shipped", "delivered"];

const OrderTracking = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const reference = searchParams.get("ref") ?? "";
  const [input, setInput] = useState(reference);

  const { data, isLoading, isError } = useOrderTracking(reference || undefined);
  const order = data?.data;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ ref: input.trim().toUpperCase() });
  };

  const reachedIndex = order ? STATUS_SEQUENCE.indexOf(order.status.slug) : -1;

  return (
    <div>
      <PageHeader
        kicker={t("Order Registry", "سجل الطلبات")}
        title={
          <>
            {t("Track your", "تتبع")} <em className="text-gloss">{t("order", "طلبك")}</em>
          </>
        }
        intro={t(
          "Enter the reference code from your confirmation (e.g. SG-7K2M9QX4).",
          "أدخل رمز المرجع من تأكيد طلبك (مثال: SG-7K2M9QX4).",
        )}
      />

      <section className="container max-w-3xl py-16">
        <ScrollReveal direction="none">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <label className="relative flex flex-1 items-center">
              <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="SG-XXXXXXXX"
                className="w-full border border-ink/20 bg-transparent py-4 pl-12 pr-4 font-mono uppercase tracking-widest outline-none transition-colors focus:border-ink"
              />
            </label>
            <button
              type="submit"
              className="shine bg-ink px-8 font-mono text-sm font-bold uppercase tracking-widest text-paper transition-colors hover:bg-solar hover:text-ink"
            >
              {t("Trace", "تتبع")}
            </button>
          </form>
        </ScrollReveal>

        {isLoading && reference && (
          <p className="mt-12 text-center font-mono text-sm text-muted-foreground">
            {t("Searching the registry…", "جارٍ البحث في السجل…")}
          </p>
        )}

        {isError && reference && (
          <p className="mt-12 border border-destructive/40 bg-destructive/5 p-6 text-center font-mono text-sm text-destructive">
            {t("No order found for that reference.", "لم يتم العثور على طلب بهذا المرجع.")}
          </p>
        )}

        {order && (
          <ScrollReveal className="mt-14">
            <div className="border border-ink/15">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/15 bg-ink p-6 text-paper">
                <span className="font-mono text-xl font-bold text-solar">{order.reference}</span>
                <span className="kicker text-paper/70">
                  {t("Placed", "تم الطلب")} {formatDate(order.placed_at)}
                </span>
              </div>

              {/* status timeline */}
              <div className="grid gap-0 p-6 sm:grid-cols-4">
                {STATUS_SEQUENCE.map((status, i) => {
                  const reached = reachedIndex >= i;
                  const cancelled = order.status.slug === "cancelled";
                  return (
                    <div key={status} className="flex items-center gap-3 py-2 sm:flex-col sm:py-0 sm:text-center">
                      {reached && !cancelled ? (
                        <CheckCircle2 className="h-6 w-6 text-solar-deep" />
                      ) : (
                        <CircleDashed className="h-6 w-6 text-muted-foreground/40" />
                      )}
                      <span
                        className={cn(
                          "kicker text-[0.6rem]",
                          reached && !cancelled ? "text-ink" : "text-muted-foreground/60",
                        )}
                      >
                        {t(
                          status.charAt(0).toUpperCase() + status.slice(1),
                          { pending: "قيد الانتظار", confirmed: "مؤكد", shipped: "تم الشحن", delivered: "تم التوصيل" }[status],
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {order.status.slug === "cancelled" && (
                <p className="mx-6 mb-6 border border-destructive/40 bg-destructive/5 p-4 text-center font-mono text-sm text-destructive">
                  {t("This order was cancelled.", "تم إلغاء هذا الطلب.")}
                </p>
              )}

              {/* items */}
              <ul className="divide-y divide-ink/10 border-t border-ink/15 px-6">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-4 py-4 text-sm">
                    <span>
                      <span className="font-mono text-muted-foreground">{item.quantity}×</span>{" "}
                      {item.product_name}
                    </span>
                    <span className="font-mono">{formatCurrency(item.line_total)}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-ink/15 bg-paper-soft p-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("Subtotal", "المجموع الفرعي")}</span>
                  <span className="font-mono">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("Shipping", "الشحن")}</span>
                  <span className="font-mono">
                    {order.shipping === 0 ? t("Free", "مجاني") : formatCurrency(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-ink/15 pt-3">
                  <span className="kicker">{t("Total", "الإجمالي")}</span>
                  <span className="font-mono text-lg font-bold">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}
      </section>
    </div>
  );
};

export default OrderTracking;
