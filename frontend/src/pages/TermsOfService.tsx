import StaticArticle from "@/components/layout/StaticArticle";
import { useLanguage } from "@/contexts/LanguageContext";

const TermsOfService = () => {
  const { t } = useLanguage();

  return (
    <StaticArticle
      kicker={t("The Fine Print", "الشروط")}
      title={
        <>
          {t("Terms of", "شروط")} <em className="text-gloss">{t("service", "الخدمة")}</em>
        </>
      }
      sections={[
        {
          heading: t("Orders & confirmation", "الطلبات والتأكيد"),
          body: t(
            "An order is binding once confirmed by our team by phone or email. Prices shown at checkout are recalculated and verified server-side at the moment of ordering.",
            "يصبح الطلب ملزماً بمجرد تأكيده من فريقنا هاتفياً أو بالبريد. تُعاد حساب الأسعار الظاهرة عند الدفع ويتم التحقق منها في الخادم لحظة الطلب.",
          ),
        },
        {
          heading: t("Delivery", "التوصيل"),
          body: t(
            "Standard delivery takes 3–7 business days. Free shipping applies to orders above $1,000; a flat rate applies below that threshold.",
            "يستغرق التوصيل القياسي ٣-٧ أيام عمل. يطبق الشحن المجاني على الطلبات فوق ١٠٠٠ دولار؛ وتطبق رسوم ثابتة دون ذلك.",
          ),
        },
        {
          heading: t("Suitability & installation", "الملاءمة والتركيب"),
          body: t(
            "Electrical installation must be performed by a certified professional. Specifications are provided for qualified planning, not as installation instructions.",
            "يجب أن يتم التركيب الكهربائي بواسطة محترف معتمد. المواصفات مقدمة للتخطيط المؤهل، وليست تعليمات تركيب.",
          ),
        },
        {
          heading: t("Privacy", "الخصوصية"),
          body: t(
            "We store only the details needed to fulfil your order and never sell customer data. Tracking references are anonymous codes that expose no personal information.",
            "نخزن فقط التفاصيل اللازمة لتنفيذ طلبك ولا نبيع بيانات العملاء أبداً. مراجع التتبع رموز مجهولة لا تكشف أي معلومات شخصية.",
          ),
        },
      ]}
    />
  );
};

export default TermsOfService;
