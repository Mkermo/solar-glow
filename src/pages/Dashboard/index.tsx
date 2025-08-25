import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import ScrollReveal from "@/components/ScrollReveal";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { t, lang } = useLanguage();
  const { user, loading } = useAuth();

  // Check if user is authenticated
  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-4">{t("Loading...", "جاري التحميل...")}</p>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container py-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      <ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          <DashboardSidebar />
          <main className="min-h-[600px]">
            {/* This is where nested routes will render */}
            <Outlet />
          </main>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Dashboard;