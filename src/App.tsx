import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext"; // Remove ProtectedRoute from here
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from '@/components/ProtectedRoute'; // Only import ProtectedRoute from here
import { useEffect } from 'react';
import { setupStorage } from '@/lib/setupStorage';
import ForumCategoriesInitializer from '@/components/ForumCategoriesInitializer';
import Footer from "@/components/Footer";
import MainLayout from "./layouts/MainLayout";
import Index from "./pages/Index";
import SolarEducation from "./pages/SolarEducation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQs from "./pages/FAQs";
import ReturnRefund from "./pages/ReturnRefund";
import TermsOfService from "./pages/TermsOfService";
import Forum from "./pages/Forum";
import CategoryView from "./pages/Forum/CategoryView";
import TopicView from "./pages/Forum/TopicView";
import NewTopic from "./pages/Forum/NewTopic";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import LoginSuccess from "./pages/LoginSuccess";
import Dashboard from "./pages/Dashboard";
import ProductManagement from "./pages/Dashboard/ProductManagement";
import ProductEdit from "./pages/ProductEdit";
import AddProduct from "./pages/AddProduct";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

function App() {
  // Setup storage buckets on app initialization
  useEffect(() => {
    setupStorage().then(result => {
      console.log('Storage setup result:', result);
    });
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <ForumCategoriesInitializer />
              <BrowserRouter>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/solar-education" element={<SolarEducation />} />
                    <Route path="/education" element={<SolarEducation />} />
                    <Route path="/products/:category" element={<ProductListing />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/product/:id-ar" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders/tracking" element={<OrderTracking />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/return-refund" element={<ReturnRefund />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    
                    {/* Protected Admin Routes */}
                    <Route 
                      path="/dashboard"
                      element={
                        <ProtectedRoute requireAdmin>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<ProductManagement />} />
                      <Route path="products" element={<ProductManagement />} />
                    </Route>
                    
                    {/* Forum Routes */}
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/forum/category/:categoryId" element={<CategoryView />} />
                    <Route path="/forum/topic/:topicId" element={<TopicView />} />
                    <Route 
                      path="/forum/new-topic" 
                      element={
                        <ProtectedRoute>
                          <NewTopic />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/forum/new-topic/:categoryId" 
                      element={
                        <ProtectedRoute>
                          <NewTopic />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Profile Route */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Other Routes */}
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/login-success" element={<LoginSuccess />} />
                    <Route 
                      path="/dashboard/product/:id" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <ProductEdit />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard/add-product" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <AddProduct />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MainLayout>
              </BrowserRouter>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
