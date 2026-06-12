import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Marquee from "@/components/decor/Marquee";

const Footer = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t("Shop", "تسوق"),
      links: [
        { to: "/products?category=panels", label: t("Solar Panels", "الألواح الشمسية") },
        { to: "/products?category=inverters", label: t("Inverters", "العاكسات") },
        { to: "/products?category=batteries", label: t("Batteries", "البطاريات") },
        { to: "/products?category=accessories", label: t("Accessories", "الإكسسوارات") },
      ],
    },
    {
      title: t("Company", "الشركة"),
      links: [
        { to: "/about", label: t("About", "من نحن") },
        { to: "/education", label: t("Solar Education", "تعلم الطاقة الشمسية") },
        { to: "/contact", label: t("Contact", "اتصل بنا") },
      ],
    },
    {
      title: t("Support", "الدعم"),
      links: [
        { to: "/faqs", label: t("FAQs", "الأسئلة الشائعة") },
        { to: "/orders/tracking", label: t("Track Order", "تتبع الطلب") },
        { to: "/return-refund", label: t("Returns & Refunds", "الإرجاع والاسترداد") },
        { to: "/terms", label: t("Terms of Service", "شروط الخدمة") },
      ],
    },
  ];

  return (
    <footer className="bg-ink text-paper">
      <Marquee
        slow
        className="kicker border-y border-white/10 py-4 text-paper/70"
        items={[
          t("Free shipping over $1,000", "شحن مجاني فوق 1000 دولار"),
          t("Up to 35-year warranty", "ضمان حتى 35 سنة"),
          t("Certified installers network", "شبكة مركّبين معتمدين"),
          t("Engineered for the sun", "مصمم للشمس"),
        ]}
      />

      <div className="container grid gap-12 py-16 md:grid-cols-[2fr,1fr,1fr,1fr]">
        <div className="space-y-6">
          <p className="font-serif text-display-md leading-none">
            Solar <em className="text-gloss not-italic font-serif italic">Glow</em>
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-paper/60">
            {t(
              "Premium solar hardware, curated like a print catalogue. Panels, inverters and storage — engineered for the next century of sunlight.",
              "أجهزة شمسية فاخرة، منسقة ككتالوج مطبوع. ألواح وعاكسات وبطاريات — مصممة لقرن قادم من ضوء الشمس.",
            )}
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="space-y-4">
            <p className="kicker text-solar">{column.title}</p>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-paper/70 transition-colors hover:text-solar"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 font-mono text-xs text-paper/50 sm:flex-row">
          <span>© {year} Solar Glow. {t("All rights reserved.", "جميع الحقوق محفوظة.")}</span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="text-solar">✦</span>
            {t("Printed by the sun", "طُبع بواسطة الشمس")}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
