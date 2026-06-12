import StaticArticle from "@/components/layout/StaticArticle";
import { useLanguage } from "@/contexts/LanguageContext";

const ReturnRefund = () => {
  const { t } = useLanguage();

  return (
    <StaticArticle
      kicker={t("House Policy", "سياسة الدار")}
      title={
        <>
          {t("Returns &", "الإرجاع")} <em className="text-gloss">{t("refunds", "والاسترداد")}</em>
        </>
      }
      sections={[
        {
          heading: t("30-day return window", "نافذة إرجاع ٣٠ يوماً"),
          body: t(
            "Unused products in original packaging can be returned within 30 days of delivery for a full refund of the product price.",
            "يمكن إرجاع المنتجات غير المستخدمة في عبواتها الأصلية خلال ٣٠ يوماً من التسليم لاسترداد كامل سعر المنتج.",
          ),
        },
        {
          heading: t("Damaged on arrival", "تلف عند الوصول"),
          body: t(
            "Photograph any transit damage within 48 hours and contact us — we ship a replacement immediately and handle the carrier claim ourselves.",
            "صوّر أي ضرر ناتج عن النقل خلال ٤٨ ساعة وتواصل معنا — نشحن بديلاً فوراً ونتولى مطالبة الناقل بأنفسنا.",
          ),
        },
        {
          heading: t("Refund timing", "توقيت الاسترداد"),
          body: t(
            "Refunds are issued to the original payment method within 5–7 business days of the returned item passing inspection.",
            "تُصرف المبالغ المستردة إلى وسيلة الدفع الأصلية خلال ٥-٧ أيام عمل من اجتياز المنتج المرتجع للفحص.",
          ),
        },
        {
          heading: t("Warranty claims", "مطالبات الضمان"),
          body: t(
            "Performance warranties (up to 35 years on panels) are honoured directly by us — keep your order reference and we handle the manufacturer.",
            "ضمانات الأداء (حتى ٣٥ سنة على الألواح) نلتزم بها مباشرة — احتفظ بمرجع طلبك ونحن نتولى التعامل مع الشركة المصنعة.",
          ),
        },
      ]}
    />
  );
};

export default ReturnRefund;
