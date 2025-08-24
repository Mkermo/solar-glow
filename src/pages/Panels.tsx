import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const Panels = () => {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);

  // Fetch panels data
  const { data: products, isLoading } = useQuery({
    queryKey: ['panels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'panels');
      
      if (error) throw error;
      return data;
    }
  });

  // Translations
  const t = {
    en: {
      title: "Solar Panels",
      search: "Search panels...",
      priceRange: "Price Range",
      sortBy: "Sort by",
      filters: "Filters",
      loading: "Loading panels...",
      noProducts: "No panels found",
      productsFound: "panels found",
    },
    ar: {
      title: "الألواح الشمسية",
      search: "البحث عن الألواح...",
      priceRange: "نطاق السعر",
      sortBy: "ترتيب حسب",
      filters: "التصفية",
      loading: "جاري التحميل...",
      noProducts: "لم يتم العثور على ألواح",
      productsFound: "لوح تم العثور عليه",
    }
  };

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4">{t[lang].loading}</p>
      </div>
    );
  }

  return (
    <div className="container py-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      <h1 className="text-3xl font-bold mb-8">{t[lang].title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{t[lang].filters}</h2>
          <div>
            <Input
              placeholder={t[lang].search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <h3 className="font-medium mb-2">{t[lang].priceRange}</h3>
            <Slider
              min={0}
              max={5000}
              step={100}
              value={priceRange}
              onValueChange={setPriceRange}
            />
            <div className="flex justify-between mt-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}${lang === "ar" ? "-ar" : ""}`}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <img 
                  src={product.image_url} 
                  alt={lang === "ar" ? product.name_ar : product.name}
                  className="w-full h-48 object-contain mb-4"
                />
                <h3 className="font-semibold mb-2">
                  {lang === "ar" ? product.name_ar : product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {lang === "ar" ? product.description_ar : product.description}
                </p>
                <p className="font-bold">${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panels;