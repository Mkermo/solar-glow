import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  ShoppingBag, 
  Users, 
  Settings, 
  Package, 
  BarChart,
  MessageSquare 
} from "lucide-react";

const DashboardSidebar = () => {
  const { t } = useLanguage();
  const location = useLocation();
  
  // Helper to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    {
      name: t("Dashboard", "لوحة التحكم"),
      path: "/dashboard",
      icon: <BarChart className="h-5 w-5 mr-2" />
    },
    {
      name: t("Orders", "الطلبات"),
      path: "/dashboard/orders",
      icon: <ShoppingBag className="h-5 w-5 mr-2" />
    },
    {
      name: t("Products", "المنتجات"),
      path: "/dashboard/products",
      icon: <Package className="h-5 w-5 mr-2" />
    },
    {
      name: t("Users", "المستخدمون"),
      path: "/dashboard/users",
      icon: <Users className="h-5 w-5 mr-2" />
    },
    {
      name: t("Forum Management", "إدارة المنتدى"),
      path: "/dashboard/forum",
      icon: <MessageSquare className="h-5 w-5 mr-2" />
    },
    {
      name: t("Settings", "الإعدادات"),
      path: "/dashboard/settings",
      icon: <Settings className="h-5 w-5 mr-2" />
    }
  ];
  
  return (
    <nav className="border rounded-lg p-4">
      <h2 className="font-bold text-lg mb-4">{t("Admin Dashboard", "لوحة تحكم المسؤول")}</h2>
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center p-2 rounded-lg hover:bg-muted transition-colors ${
                isActive(item.path) ? "bg-muted font-medium" : ""
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DashboardSidebar;

// In your Navbar component where the language toggle button is defined

// Change from:
<Button
  variant="ghost"
  size="icon"
  className="h-8 w-8 rounded-full"
  onClick={toggleLanguage}
>
  <span className="sr-only">Toggle language</span>
  <Globe className="h-4 w-4" />
  <span className="absolute bottom-0 right-0 h-3 w-3 bg-primary rounded-full flex items-center justify-center text-[8px] font-bold text-white">
    {lang === "en" ? "ع" : "E"}
  </span>
</Button>

// Change to:
<Button
  variant="ghost"
  size="icon"
  className="h-8 w-8 rounded-full relative" // Added "relative" here
  onClick={toggleLanguage}
>
  <span className="sr-only">Toggle language</span>
  <Globe className="h-4 w-4" />
  <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-[8px] font-bold text-white">
    {lang === "en" ? "ع" : "E"}
  </span>
</Button>