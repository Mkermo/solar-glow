import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GrainOverlay from "@/components/decor/GrainOverlay";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <GrainOverlay />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
