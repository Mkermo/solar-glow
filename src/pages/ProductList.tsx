import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, Filter } from "lucide-react";

const ProductList = () => {
  const { category } = useParams();
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortOption, setSortOption] = useState("price-asc");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log("Fetching products for category:", category);
        
        let query = supabase.from("products").select("*");

        if (category && category !== "all") {
          query = query.eq("category", category);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Fetched products:", data);
        
        if (data && data.length > 0) {
          setProducts(data);
          
          // Find the highest price for the slider
          const highest = Math.ceil(Math.max(...data.map(p => p.price || 0)));
          setMaxPrice(highest > 0 ? highest : 5000);
          setPriceRange([0, highest > 0 ? highest : 5000]);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // Filter and sort products
  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }
    
    let result = [...products];

    // Search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (product) => {
          const nameMatch = product.name?.toLowerCase().includes(term);
          const nameArMatch = product.name_ar?.toLowerCase().includes(term);
          const descMatch = product.description?.toLowerCase().includes(term);
          const descArMatch = product.description_ar?.toLowerCase().includes(term);
          return nameMatch || nameArMatch || descMatch || descArMatch;
        }
      );
    }

    // Price filter
    result = result.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return getProductName(a).localeCompare(getProductName(b));
        case "name-desc":
          return getProductName(b).localeCompare(getProductName(a));
        default:
          return 0;
      }
    });

    setFilteredProducts(result);
  }, [products, searchTerm, priceRange, sortOption, lang]);

  // Helper to get product name based on language
  const getProductName = (product) => {
    if (lang === 'ar' && product.name_ar) {
      return product.name_ar;
    }
    return product.name;
  };
  
  // Helper to get product description based on language
  const getProductDescription = (product) => {
    if (lang === 'ar' && product.description_ar) {
      return product.description_ar;
    }
    return product.description;
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast({
      title: t("Added to Cart", "تمت الإضافة إلى السلة"),
      description: t(
        `${product.name} has been added to your cart`, 
        `تمت إضافة ${product.name_ar || product.name} إلى سلة التسوق`
      ),
    });
  };

  // Get category title
  const getCategoryTitle = () => {
    if (!category || category === "all") return t("All Products", "جميع المنتجات");
    
    const categories = {
      panels: [t("Solar Panels", "الألواح الشمسية")],
      inverters: [t("Inverters", "المحولات")],
      batteries: [t("Batteries", "البطاريات")],
      accessories: [t("Accessories", "الملحقات")]
    };
    
    return categories[category] || t("Products", "المنتجات");
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{getCategoryTitle()}</h1>

      {/* Mobile filter toggle */}
      <Button 
        variant="outline" 
        className="mb-4 md:hidden flex items-center gap-2"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="h-4 w-4" />
        {t("Filters", "الفلاتر")}
      </Button>

      {/* Filters */}
      <div className={`grid gap-4 mb-6 ${showFilters || window.innerWidth >= 768 ? 'block' : 'hidden md:block'}`}>
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            placeholder={t("Search products...", "البحث عن منتجات...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="space-y-2">
            <label>{t("Price Range", "نطاق السعر")}</label>
            <Slider
              value={priceRange}
              min={0}
              max={maxPrice}
              step={50}
              onValueChange={(value) => setPriceRange(value as [number, number])}
            />
            <div className="flex justify-between text-sm">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("Sort by", "ترتيب حسب")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">{t("Price: Low to High", "السعر: من الأقل إلى الأعلى")}</SelectItem>
              <SelectItem value="price-desc">{t("Price: High to Low", "السعر: من الأعلى إلى الأقل")}</SelectItem>
              <SelectItem value="name-asc">{t("Name: A to Z", "الاسم: أ إلى ي")}</SelectItem>
              <SelectItem value="name-desc">{t("Name: Z to A", "الاسم: ي إلى أ")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Count */}
      <p className="text-sm text-gray-500 mb-6">
        {t("Showing", "عرض")} {filteredProducts.length} {t("products", "منتج")}
      </p>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4">{t("Loading products...", "جاري تحميل المنتجات...")}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/20">
          <p className="text-lg">{t("No products found", "لم يتم العثور على منتجات")}</p>
          <p className="mt-2 text-gray-500">{t("Try adjusting your filters", "حاول تعديل عوامل التصفية")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <Link to={`/product/${product.id}`}>
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={product.image_url}
                    alt={getProductName(product)}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/400x300?text=No+Image';
                    }}
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h2 className="font-semibold mb-2 hover:text-primary transition-colors">
                    {getProductName(product)}
                  </h2>
                </Link>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                  {getProductDescription(product)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">${product.price?.toFixed(2) || "0.00"}</span>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t("Add", "إضافة")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;