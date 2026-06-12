import { useState, type FormEvent } from "react";
import { LoaderCircle, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { useSendContactMessage } from "@/api/queries";
import PageHeader from "@/components/layout/PageHeader";
import ScrollReveal from "@/components/decor/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();
  const sendMessage = useSendContactMessage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const setField = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const result = await sendMessage.mutateAsync(form);
      toast.success(result.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        setErrors(error.errors);
        toast.error(error.message);
      } else {
        toast.error(t("Could not send your message.", "تعذر إرسال رسالتك."));
      }
    }
  };

  const channels = [
    { icon: Mail, label: t("Email", "البريد"), value: "hello@solarglow.test" },
    { icon: Phone, label: t("Phone", "الهاتف"), value: "+962 7 0000 0000" },
    { icon: MapPin, label: t("Studio", "المكتب"), value: t("Amman, Jordan", "عمّان، الأردن") },
  ];

  const inputClass =
    "mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none transition-colors focus:border-solar-deep";

  return (
    <div>
      <PageHeader
        kicker={t("Correspondence", "المراسلات")}
        title={
          <>
            {t("Write to", "اكتب")} <em className="text-gloss">{t("the editors", "إلينا")}</em>
          </>
        }
        intro={t(
          "Quotes, roof surveys, wholesale, press — every letter is read and answered within one working day.",
          "عروض الأسعار، معاينة الأسطح، الجملة — كل رسالة تُقرأ ويُرد عليها خلال يوم عمل واحد.",
        )}
      />

      <section className="container grid gap-16 py-16 lg:grid-cols-[1fr,2fr]">
        <div className="space-y-8">
          {channels.map((channel, i) => (
            <ScrollReveal key={channel.label} delay={i * 0.08}>
              <div className="flex items-start gap-4 border-t border-ink/15 pt-5">
                <channel.icon className="mt-1 h-5 w-5 text-solar-deep" />
                <div>
                  <p className="kicker text-[0.6rem] text-muted-foreground">{channel.label}</p>
                  <p className="mt-1 font-mono text-sm font-bold">{channel.value}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.1}>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <label className="block">
                <span className="kicker text-[0.6rem] text-muted-foreground">
                  {t("Name", "الاسم")} <span className="text-solar-deep">*</span>
                </span>
                <input value={form.name} onChange={(e) => setField("name")(e.target.value)} required className={inputClass} />
                {errors.name && <span className="mt-1 block text-xs text-destructive">{errors.name[0]}</span>}
              </label>
              <label className="block">
                <span className="kicker text-[0.6rem] text-muted-foreground">
                  {t("Email", "البريد الإلكتروني")} <span className="text-solar-deep">*</span>
                </span>
                <input type="email" value={form.email} onChange={(e) => setField("email")(e.target.value)} required className={inputClass} />
                {errors.email && <span className="mt-1 block text-xs text-destructive">{errors.email[0]}</span>}
              </label>
            </div>
            <label className="block">
              <span className="kicker text-[0.6rem] text-muted-foreground">{t("Subject", "الموضوع")}</span>
              <input value={form.subject} onChange={(e) => setField("subject")(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="kicker text-[0.6rem] text-muted-foreground">
                {t("Message", "الرسالة")} <span className="text-solar-deep">*</span>
              </span>
              <textarea
                value={form.message}
                onChange={(e) => setField("message")(e.target.value)}
                required
                rows={6}
                className={inputClass}
              />
              {errors.message && <span className="mt-1 block text-xs text-destructive">{errors.message[0]}</span>}
            </label>

            <button
              type="submit"
              disabled={sendMessage.isPending}
              className="shine inline-flex items-center gap-3 bg-ink px-10 py-4 font-mono text-sm font-bold uppercase tracking-widest text-paper transition-colors hover:bg-solar hover:text-ink disabled:opacity-50"
            >
              {sendMessage.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {t("Send letter", "إرسال")}
            </button>
          </form>
        </ScrollReveal>
      </section>
    </div>
  );
};

export default Contact;
