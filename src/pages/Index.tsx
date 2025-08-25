import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Sun, ArrowRight, Truck, Package, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";

// Define the Product interface
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Get language context
  const { t, lang } = useLanguage();

  // Get featured products (2 panels, 2 inverters)
  const featuredPanels = products
    .filter(product => product.category === "panels")
    .slice(0, 2);
  
  const featuredInverters = products
    .filter(product => product.category === "inverters")
    .slice(0, 2);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      console.log('Fetching products...'); // Debug log
      
      const { data: panelsData, error: panelsError } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'panels')
        .limit(2);

      const { data: invertersData, error: invertersError } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'inverters')
        .limit(2);

      if (panelsError || invertersError) {
        throw panelsError || invertersError;
      }

      const combinedProducts = [...(panelsData || []), ...(invertersData || [])];
      console.log('Fetched products:', combinedProducts); // Debug log
      
      setProducts(combinedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Add a debug log to check component rendering
  console.log('Rendering Index with products:', products);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl text-red-600 mb-2">Error loading products</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full"></div>
      </div>
    );
  }

  // Check if we have products before rendering full page
  if (!products.length) {
    return (
      <div className="min-h-screen">
        <section className="bg-gradient-to-br from-solar-blue to-blue-700 text-white">
          <div className="container py-20 md:py-32 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("Power Your Home with Solar Energy", "زوّد منزلك بالطاقة الشمسية")}
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8 text-blue-100">
              {t("High-quality solar panels and inverters for sustainable energy solutions.", "ألواح شمسية ومحولات عالية الجودة لحلول الطاقة المستدامة.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <Link to="/products/panels">
                  {t("Shop Solar Panels", "تسوق الألواح الشمسية")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20">
                <Link to="/products/inverters">
                  {t("Browse Inverters", "تصفح المحولات")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">No products available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-solar-blue to-blue-700 text-white">
        <div className="container py-20 md:py-32 flex flex-col items-center text-center">
          <ScrollReveal initiallyVisible={true}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("Power Your Home with Solar Energy", "زوّد منزلك بالطاقة الشمسية")}
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.1}>
            <p className="text-lg md:text-xl max-w-2xl mb-8 text-blue-100">
              {t("High-quality solar panels and inverters for sustainable energy solutions.", "ألواح شمسية ومحولات عالية الجودة لحلول الطاقة المستدامة.")}
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90">
                <Link to="/products/panels">
                  {t("Shop Solar Panels", "تسوّق الألواح الشمسية")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20" asChild>
                <Link to="/contact">
                  {t("Get a Quote", "احصل على عرض سعر")}
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-12">{t("Our Features", "مميزاتنا")}</h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="border rounded-lg p-6 h-full flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Sun className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("High Efficiency", "كفاءة عالية")}</h3>
                <p className="text-muted-foreground">
                  {t("Our premium panels deliver industry-leading efficiency rates for maximum energy production.", "تقدم ألواحنا المتميزة معدلات كفاءة رائدة في الصناعة لأقصى إنتاج للطاقة.")}
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.2}>
              <div className="border rounded-lg p-6 h-full flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("Fast Delivery", "توصيل سريع")}</h3>
                <p className="text-muted-foreground">
                  {t("Quick and reliable shipping to your doorstep with professional handling.", "شحن سريع وموثوق به إلى باب منزلك مع تعامل احترافي.")}
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.3}>
              <div className="border rounded-lg p-6 h-full flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("Warranty", "ضمان")}</h3>
                <p className="text-muted-foreground">
                  {t("All products come with extended warranty and dedicated customer support.", "تأتي جميع المنتجات مع ضمان ممتد ودعم مخصص للعملاء.")}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-muted">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center mb-12">{t("Why Choose SolarG", "لماذا تختار SolarG")}</h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <ScrollReveal direction="left">
              <img 
                src="/images/solar-home.jpg" 
                alt={t("Solar powered home", "منزل يعمل بالطاقة الشمسية")} 
                className="rounded-lg shadow-lg w-full"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/600x400?text=Solar+Home';
                }}
              />
            </ScrollReveal>
            
            <ScrollReveal direction="right">
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{t("Expert Consultation", "استشارة خبيرة")}</h3>
                    <p className="text-muted-foreground">
                      {t("Our team provides personalized advice for your specific energy needs.", "يقدم فريقنا نصائح مخصصة لاحتياجات الطاقة الخاصة بك.")}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{t("Quality Products", "منتجات عالية الجودة")}</h3>
                    <p className="text-muted-foreground">
                      {t("We only source from reputable manufacturers with proven track records.", "نحن نستورد فقط من مصنعين ذوي سمعة طيبة مع سجلات حافلة.")}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{t("After-Sales Support", "دعم ما بعد البيع")}</h3>
                    <p className="text-muted-foreground">
                      {t("Dedicated support team to assist you with any questions or concerns.", "فريق دعم مخصص لمساعدتك في أي أسئلة أو مخاوف.")}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <ScrollReveal>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">{t("Featured Products", "المنتجات المميزة")}</h2>
              <Button variant="outline" asChild>
                <Link to="/products/all">
                  {t("View All", "عرض الكل")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>

          {/* Solar Panels */}
          <ScrollReveal>
            <h3 className="text-xl font-semibold mb-4">{t("Solar Panels", "الألواح الشمسية")}</h3>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {featuredPanels.length > 0 ? (
              featuredPanels.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 0.1}>
                  <Link to={`/product/${product.id}`} className="block border rounded-lg overflow-hidden hover:border-primary transition-colors">
                    <div className="aspect-video bg-muted/20">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/600x400?text=Solar+Panel';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">{product.name}</h4>
                      <p className="text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">${product.price.toFixed(2)}</span>
                        <Button size="sm">
                          {t("View Details", "عرض التفاصيل")}
                        </Button>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))
            ) : (
              <p>{t("No solar panels available", "لا توجد ألواح شمسية متاحة")}</p>
            )}
          </div>
          
          {/* Inverters */}
          <ScrollReveal>
            <h3 className="text-xl font-semibold mb-4">{t("Inverters", "العاكسات")}</h3>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {featuredInverters.length > 0 ? (
              featuredInverters.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 0.1}>
                  <Link to={`/product/${product.id}`} className="block border rounded-lg overflow-hidden hover:border-primary transition-colors">
                    <div className="aspect-video bg-muted/20">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/600x400?text=Inverter';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">{product.name}</h4>
                      <p className="text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">${product.price.toFixed(2)}</span>
                        <Button size="sm">
                          {t("View Details", "عرض التفاصيل")}
                        </Button>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))
            ) : (
              <p>{t("No inverters available", "لا توجد عاكسات متاحة")}</p>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-solar-blue to-blue-700 text-white">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold mb-4">
              {t("Ready to Switch to Solar?", "هل أنت مستعد للتحول إلى الطاقة الشمسية؟")}
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={0.1}>
            <p className="text-xl max-w-2xl mx-auto mb-8 text-blue-100">
              {t("Start your journey to energy independence with our premium solar products.", "ابدأ رحلتك نحو استقلال الطاقة مع منتجاتنا الشمسية المتميزة.")}
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <Button size="lg" className="bg-white text-solar-blue hover:bg-blue-50" asChild>
              <Link to="/products/panels">
                {t("Shop Now", "تسوق الآن")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer info banner */}
      <section className="py-8 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="flex items-center gap-3">
                <Truck className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold">{t("Free Shipping", "شحن مجاني")}</h3>
                  <p className="text-sm text-muted-foreground">{t("On orders over $1000", "على الطلبات التي تزيد عن 1000 دولار")}</p>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.2}>
              <div className="flex items-center gap-3">
                <Package className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold">{t("Secure Packaging", "تغليف آمن")}</h3>
                  <p className="text-sm text-muted-foreground">{t("Safe delivery guaranteed", "ضمان التسليم الآمن")}</p>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.3}>
              <div className="flex items-center gap-3">
                <Check className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold">{t("Warranty", "ضمان")}</h3>
                  <p className="text-sm text-muted-foreground">{t("5-year product warranty", "ضمان المنتج لمدة 5 سنوات")}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper functions for Arabic translations of product names and descriptions
const getArabicProductName = (englishName) => {
  // Map of product names to their Arabic translations
  const nameTranslations = {
    "SolarG Premium 400W Solar Panel": "لوح شمسي SolarG بريميوم 400 واط",
    "SolarG Elite 500W Solar Panel": "لوح شمسي SolarG إيليت 500 واط",
    "SolarG Home 5kW Inverter": "محول SolarG منزلي 5 كيلوواط",
    "SolarG Pro 10kW Three-Phase Inverter": "محول SolarG برو ثلاثي الطور 10 كيلوواط",
  };
  
  return nameTranslations[englishName] || `${englishName} (بالعربية)`;
};

const getArabicProductDescription = (englishDescription) => {
  // Map of product descriptions to their Arabic translations
  const descriptionTranslations = {
    "High-efficiency monocrystalline solar panel with advanced cell technology for maximum power output even in low-light conditions. Perfect for residential installations.": 
      "لوح شمسي أحادي البلورية عالي الكفاءة مع تقنية خلايا متقدمة لأقصى إنتاج للطاقة حتى في ظروف الإضاءة المنخفضة. مثالي للتركيبات السكنية.",
    "Our highest-power residential solar panel featuring next-generation cell architecture for superior performance in all weather conditions. Ideal for maximizing energy production in limited roof space.": 
      "لوح شمسي منزلي بأعلى قدرة يتميز بهندسة خلايا الجيل التالي للأداء المتفوق في جميع الظروف الجوية. مثالي لزيادة إنتاج الطاقة في مساحة السقف المحدودة.",
    "Reliable single-phase string inverter for residential solar installations. Features maximum efficiency with advanced MPPT technology and comprehensive system monitoring.": 
      "محول سلسلة أحادي الطور موثوق للتركيبات الشمسية السكنية. يتميز بكفاءة قصوى مع تقنية MPPT المتقدمة ومراقبة شاملة للنظام.",
    "Professional three-phase inverter for large residential or small commercial installations. Features dual MPPT tracking, extended DC input range, and integrated energy management system.":
      "محول ثلاثي الطور احترافي للتركيبات السكنية الكبيرة أو التجارية الصغيرة. يتميز بتتبع MPPT مزدوج، ونطاق دخل DC موسع، ونظام متكامل لإدارة الطاقة.",
  };
  
  return descriptionTranslations[englishDescription] || `${englishDescription} (بالعربية)`;
};

export default Index;
