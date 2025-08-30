import { lazy, Suspense } from "react";
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Pages with lazy loading
const Index = lazy(() => import("@/pages/Index"));
const ProductList = lazy(() => import("@/pages/ProductList"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Profile = lazy(() => import("@/pages/Profile"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Education = lazy(() => import("@/pages/Education"));

// Forum pages
const Forum = lazy(() => import("@/pages/Forum"));
// Use the newer components from the Forum directory
const ForumCategory = lazy(() => import("@/pages/Forum/CategoryView"));
const NewTopic = lazy(() => import("@/pages/Forum/NewTopic"));
const TopicView = lazy(() => import("@/pages/Forum/TopicView"));
const ForumManagement = lazy(() => import("@/pages/Dashboard/ForumManagement"));

// Loading component
const PageLoading = () => (
  <div className="container py-20 text-center">
    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
    <p className="mt-4">Loading...</p>
  </div>
);

// Route protection wrapper
const ProtectedRoute = ({ children, requiredRole = "" }: { children: React.ReactNode, requiredRole?: string }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const Routes = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <RouterRoutes>
        <Route path="/" element={<Index />} />
        
        {/* Product routes */}
        <Route path="/products/:category" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        
        {/* Cart and checkout */}
        <Route path="/cart" element={<Cart />} />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Information pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/education" element={<Education />} />
        
        {/* Forum routes */}
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/category/:categoryId" element={<ForumCategory />} />
        <Route path="/forum/new-topic/:categoryId?" element={<NewTopic />} />
        <Route path="/forum/topic/:topicId" element={<TopicView />} />
        
        {/* Admin Dashboard routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Nested dashboard routes - these render inside the Dashboard layout */}
          <Route path="forum" element={<ForumManagement />} />
          {/* Other dashboard routes... */}
        </Route>
        
        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </Suspense>
  );
};

export default Routes;