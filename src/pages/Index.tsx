import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Sun, ArrowRight, Truck, Package, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
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

  // Check if we have products before rendering
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

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">{t("Why Choose SolarG", "لماذا تختار SolarG")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sun className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("High Efficiency", "كفاءة عالية")}</h3>
              <p className="text-muted-foreground">
                {t("Our premium panels deliver industry-leading efficiency rates for maximum energy production.", "تقدم ألواحنا المتميزة معدلات كفاءة رائدة في الصناعة لأقصى إنتاج للطاقة.")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("Fast Shipping", "شحن سريع")}</h3>
              <p className="text-muted-foreground">
                {t("Quick delivery and careful packaging ensure your equipment arrives safely and on time.", "التسليم السريع والتغليف الدقيق يضمنان وصول معداتك بأمان وفي الوقت المحدد.")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("Expert Support", "دعم متخصص")}</h3>
              <p className="text-muted-foreground">
                {t("Our team of solar specialists is available to help with product selection and technical questions.", "فريق المتخصصين لدينا متاح للمساعدة في اختيار المنتجات والإجابة على الأسئلة التقنية.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12">{t("Featured Products", "المنتجات المميزة")}</h2>
          
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">{t("Solar Panels", "ألواح شمسية")}</h3>
              <Link to="/products/panels" className="text-primary flex items-center hover:underline">
                {t("View all", "عرض الكل")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featuredPanels.map((panel) => (
                <div key={panel.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={panel.image}
                      alt={t(panel.name, getArabicProductName(panel.name))}
                      className="object-cover w-full h-full p-6"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold mb-2">{t(panel.name, getArabicProductName(panel.name))}</h4>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {t(panel.description, getArabicProductDescription(panel.description))}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">${panel.price.toFixed(2)}</span>
                      <Button asChild>
                        <Link to={`/product/${panel.id}`}>{t("View Details", "عرض التفاصيل")}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">{t("Inverters", "المحولات")}</h3>
              <Link to="/products/inverters" className="text-primary flex items-center hover:underline">
                {t("View all", "عرض الكل")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featuredInverters.map((inverter) => (
                <div key={inverter.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={inverter.image}
                      alt={t(inverter.name, getArabicProductName(inverter.name))}
                      className="object-cover w-full h-full p-6"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold mb-2">{t(inverter.name, getArabicProductName(inverter.name))}</h4>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {t(inverter.description, getArabicProductDescription(inverter.description))}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">${inverter.price.toFixed(2)}</span>
                      <Button asChild>
                        <Link to={`/product/${inverter.id}`}>{t("View Details", "عرض التفاصيل")}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("Ready to Switch to Solar?", "هل أنت جاهز للتحول إلى الطاقة الشمسية؟")}
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            {t("Start your journey towards sustainable energy and reduced electricity bills today.", "ابدأ رحلتك نحو الطاقة المستدامة وفواتير كهرباء منخفضة اليوم.")}
          </p>
          <Button asChild size="lg" className="bg-white text-accent hover:bg-white/90">
            <Link to="/products/panels">{t("Shop Now", "تسوق الآن")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

// Helper functions for Arabic translations of product names and descriptions
const getArabicProductName = (englishName: string): string => {
  // Map of product names to their Arabic translations
  const nameTranslations: Record<string, string> = {
    "SolarG Premium 400W Solar Panel": "لوح شمسي SolarG بريميوم 400 واط",
    "SolarG Elite 500W Solar Panel": "لوح شمسي SolarG إيليت 500 واط",
    "SolarG Home 5kW Inverter": "محول SolarG منزلي 5 كيلوواط",
    "SolarG Pro 10kW Three-Phase Inverter": "محول SolarG برو ثلاثي الطور 10 كيلوواط",
  };
  
  return nameTranslations[englishName] || `${englishName} (بالعربية)`;
};

const getArabicProductDescription = (englishDescription: string): string => {
  // Map of product descriptions to their Arabic translations
  const descriptionTranslations: Record<string, string> = {
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
