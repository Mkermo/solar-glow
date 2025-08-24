import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  Book,
  MessageSquare,
  Home,
  Sun,
  Globe,
  Package,
  Info,
  HelpCircle,
  Mail
} from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const toggleLanguage = () => {
    const newLanguage = lang === "en" ? "ar" : "en";
    setLang(newLanguage);
    console.log(`Language switched to: ${newLanguage}`);
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-40 w-full shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Sun className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">SolarG</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>{t("Home", "الرئيسية")}</span>
          </Link>
          
          {/* Products Dropdown */}
          <div className="relative group">
            <button 
              className="flex items-center gap-1 hover:text-primary transition-colors"
              onClick={() => setIsProductsMenuOpen(!isProductsMenuOpen)}
            >
              <Package className="h-4 w-4" />
              <span>{t("Products", "المنتجات")}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block bg-background shadow-lg rounded-md py-2 min-w-[200px] border">
              <Link 
                to="/products/panels" 
                className="block px-4 py-2 hover:bg-muted transition-colors"
              >
                {t("Solar Panels", "الألواح الشمسية")}
              </Link>
              <Link 
                to="/products/inverters" 
                className="block px-4 py-2 hover:bg-muted transition-colors"
              >
                {t("Inverters", "المحولات")}
              </Link>
              <Link 
                to="/products/batteries" 
                className="block px-4 py-2 hover:bg-muted transition-colors"
              >
                {t("Batteries", "البطاريات")}
              </Link>
              <Link 
                to="/products/accessories" 
                className="block px-4 py-2 hover:bg-muted transition-colors"
              >
                {t("Accessories", "الملحقات")}
              </Link>
            </div>
          </div>
          
          {/* Important Pages - with icons */}
          <Link to="/education" className="hover:text-primary transition-colors flex items-center gap-1">
            <Book className="h-4 w-4" />
            <span>{t("Education", "التعليم")}</span>
          </Link>
          
          <Link to="/about" className="hover:text-primary transition-colors flex items-center gap-1">
            <Info className="h-4 w-4" />
            <span>{t("About", "عن الشركة")}</span>
          </Link>
          
          <Link to="/forum" className="hover:text-primary transition-colors flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{t("Forum", "المنتدى")}</span>
          </Link>
          
          <Link to="/contact" className="hover:text-primary transition-colors flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span>{t("Contact", "اتصل بنا")}</span>
          </Link>
        </div>

        {/* Right Side Actions - Using only icons for consistent sizing */}
        <div className="flex items-center gap-4">
          {/* Language Toggle - Fixed size icon */}
          <div className="relative inline-block">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full relative"
              onClick={toggleLanguage}
            >
              <span className="sr-only">Toggle language</span>
              <Globe className="h-4 w-4" />
              <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                {lang === "en" ? "ع" : "E"}
              </span>
            </Button>
          </div>

          {/* Cart - Icon only with counter */}
          <Link to="/cart" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Auth Buttons - Icons only */}
          {user ? (
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <User className="h-5 w-5" />
              </Button>
              
              <div className="absolute top-full right-0 hidden group-hover:block bg-background shadow-lg rounded-md py-2 min-w-[200px] border">
                {user.role === "admin" && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {t("Dashboard", "لوحة التحكم")}
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4" />
                  {t("Profile", "الملف الشخصي")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted transition-colors text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  {t("Logout", "تسجيل الخروج")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t py-4">
          <div className="container space-y-3">
            {/* Mobile menu items with icons */}
            <Link
              to="/"
              className="block py-2 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                {t("Home", "الرئيسية")}
              </div>
            </Link>
            
            <div>
              <button
                className="flex items-center justify-between w-full py-2 hover:text-primary"
                onClick={() => setIsProductsMenuOpen(!isProductsMenuOpen)}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t("Products", "المنتجات")}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProductsMenuOpen ? "rotate-180" : ""}`} />
              </button>
              
              {/* Submenu for products */}
              {isProductsMenuOpen && (
                <div className="ml-6 mt-2 space-y-2 border-l pl-4">
                  <Link
                    to="/products/panels"
                    className="block py-1 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("Solar Panels", "الألواح الشمسية")}
                  </Link>
                  <Link
                    to="/products/inverters"
                    className="block py-1 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("Inverters", "المحولات")}
                  </Link>
                  <Link
                    to="/products/batteries"
                    className="block py-1 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("Batteries", "البطاريات")}
                  </Link>
                  <Link
                    to="/products/accessories"
                    className="block py-1 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("Accessories", "الملحقات")}
                  </Link>
                </div>
              )}
            </div>
            
            {/* Other mobile menu items with icons */}
            <Link
              to="/education"
              className="block py-2 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                {t("Education", "التعليم")}
              </div>
            </Link>
            
            <Link
              to="/about"
              className="block py-2 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {t("About Us", "عن الشركة")}
              </div>
            </Link>
            
            <Link
              to="/forum"
              className="block py-2 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t("Community Forum", "منتدى المجتمع")}
              </div>
            </Link>
            
            <Link
              to="/contact"
              className="block py-2 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t("Contact", "اتصل بنا")}
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
