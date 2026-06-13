import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { lang, setLang, t } = useLanguage();

  const links = [
    { to: "/products", label: t("Catalogue", "المنتجات") },
    { to: "/calculator", label: t("Calculator", "الحاسبة") },
    { to: "/education", label: t("Learn", "تعلّم") },
    { to: "/about", label: t("About", "من نحن") },
    { to: "/orders/tracking", label: t("Track Order", "تتبع الطلب") },
    { to: "/contact", label: t("Contact", "اتصل بنا") },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "kicker transition-colors hover:text-solar",
      isActive ? "text-solar" : "text-paper/80",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/85 text-paper backdrop-blur-xl">
      <nav className="container flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl italic">Solar</span>
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-solar">Glow</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="kicker hidden text-paper/80 transition-colors hover:text-solar sm:block"
            aria-label="Toggle language"
          >
            {lang === "en" ? "ع" : "EN"}
          </button>

          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center border border-white/15 transition-colors hover:border-solar hover:text-solar"
            aria-label={t("Cart", "السلة")}
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center bg-solar px-1 font-mono text-[0.65rem] font-bold text-ink">
                {count}
              </span>
            )}
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center border border-white/15 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 lg:hidden">
          <div className="container flex flex-col gap-5 py-6">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="kicker text-left text-paper/80"
            >
              {lang === "en" ? "العربية" : "English"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
