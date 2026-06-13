import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderTracking from "@/pages/OrderTracking";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import FAQs from "@/pages/FAQs";
import SolarEducation from "@/pages/SolarEducation";
import Calculator from "@/pages/Calculator";
import ReturnRefund from "@/pages/ReturnRefund";
import TermsOfService from "@/pages/TermsOfService";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CartProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:category" element={<Products />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders/tracking" element={<OrderTracking />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/education" element={<SolarEducation />} />
              <Route path="/solar-education" element={<SolarEducation />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/return-refund" element={<ReturnRefund />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
        <Toaster position="bottom-right" toastOptions={{ className: "font-mono" }} />
      </CartProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
