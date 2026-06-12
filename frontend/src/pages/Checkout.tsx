import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { usePlaceOrder } from "@/api/queries";
import PageHeader from "@/components/layout/PageHeader";
import ScrollReveal from "@/components/decor/ScrollReveal";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/format";

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  error?: string;
}

/** Editorial form field — underline style, mono label. */
const Field = ({ label, name, value, onChange, type = "text", required, textarea, error }: FieldProps) => (
  <label className="block">
    <span className="kicker text-[0.6rem] text-muted-foreground">
      {label}
      {required && <span className="text-solar-deep"> *</span>}
    </span>
    {textarea ? (
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 font-sans outline-none transition-colors focus:border-solar-deep"
      />
    ) : (
      <input
        name={name}
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 font-sans outline-none transition-colors focus:border-solar-deep"
      />
    )}
    {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
  </label>
);

const Checkout = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const placeOrder = usePlaceOrder();

  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const setField = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const order = await placeOrder.mutateAsync({
        ...form,
        items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
      });
      clearCart();
      toast.success(t("Order placed!", "تم تقديم الطلب!"));
      navigate(`/orders/tracking?ref=${order.data.reference}`);
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        setErrors(error.errors);
        toast.error(error.message);
      } else {
        toast.error(t("Could not place the order. Try again.", "تعذر تقديم الطلب. حاول مرة أخرى."));
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-32 text-center">
        <p className="font-serif text-display-md italic">{t("Nothing to check out.", "لا يوجد شيء للدفع.")}</p>
        <Link to="/products" className="kicker mt-6 inline-block border-b border-ink pb-1">
          {t("Back to catalogue", "العودة للكتالوج")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        kicker={t("Final Chapter", "الفصل الأخير")}
        title={
          <>
            {t("Check", "إتمام")}<em className="text-gloss">{t("out", " الطلب")}</em>
          </>
        }
      />

      <section className="container grid gap-12 py-16 lg:grid-cols-[3fr,2fr]">
        <ScrollReveal>
          <form onSubmit={handleSubmit} className="space-y-8">
            <p className="kicker border-b border-ink/15 pb-4 text-solar-deep">
              {t("Delivery details", "تفاصيل التوصيل")}
            </p>

            <div className="grid gap-8 sm:grid-cols-2">
              <Field label={t("Full name", "الاسم الكامل")} name="customer_name" value={form.customer_name} onChange={setField("customer_name")} required error={errors.customer_name?.[0]} />
              <Field label={t("Email", "البريد الإلكتروني")} name="email" type="email" value={form.email} onChange={setField("email")} required error={errors.email?.[0]} />
              <Field label={t("Phone", "الهاتف")} name="phone" type="tel" value={form.phone} onChange={setField("phone")} error={errors.phone?.[0]} />
              <Field label={t("City", "المدينة")} name="city" value={form.city} onChange={setField("city")} required error={errors.city?.[0]} />
            </div>
            <Field label={t("Address", "العنوان")} name="address" value={form.address} onChange={setField("address")} required error={errors.address?.[0]} />
            <Field label={t("Notes (optional)", "ملاحظات (اختياري)")} name="notes" value={form.notes} onChange={setField("notes")} textarea error={errors.notes?.[0]} />

            <p className="border border-ink/15 bg-paper-soft p-4 text-xs leading-relaxed text-muted-foreground">
              {t(
                "Payment: cash on delivery or bank transfer. Our team confirms every order by phone before shipping.",
                "الدفع: نقداً عند الاستلام أو حوالة بنكية. فريقنا يؤكد كل طلب هاتفياً قبل الشحن.",
              )}
            </p>

            <button
              type="submit"
              disabled={placeOrder.isPending}
              className="shine inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-5 font-mono text-sm font-bold uppercase tracking-widest text-paper transition-colors hover:bg-solar hover:text-ink disabled:opacity-50 sm:w-auto"
            >
              {placeOrder.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {t("Place order", "تقديم الطلب")}
            </button>
          </form>
        </ScrollReveal>

        {/* order summary */}
        <ScrollReveal direction="left" delay={0.1}>
          <aside className="glass-paper h-fit border border-ink/15 p-8">
            <p className="kicker border-b border-ink/15 pb-4 text-solar-deep">
              {t("Your order", "طلبك")}
            </p>
            <ul className="divide-y divide-ink/10">
              {items.map((item) => (
                <li key={item.product.id} className="flex justify-between gap-4 py-4 text-sm">
                  <span>
                    <span className="font-mono text-muted-foreground">{item.quantity}×</span>{" "}
                    {t(item.product.name, item.product.name_ar)}
                  </span>
                  <span className="font-mono font-bold">
                    {formatCurrency(item.product.effective_price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-ink pt-4">
              <span className="kicker">{t("Subtotal", "المجموع")}</span>
              <span className="font-mono text-xl font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("Shipping is calculated server-side and shown on your tracking page.", "يحسب الشحن في الخادم ويظهر في صفحة التتبع.")}
            </p>
          </aside>
        </ScrollReveal>
      </section>
    </div>
  );
};

export default Checkout;
