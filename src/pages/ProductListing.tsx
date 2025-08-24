import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Sun, Package, Battery } from "lucide-react";
import { getProductsByCategory } from "@/data/products";
import { Product } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

const ProductListing = () => {
  const { lang } = useLanguage();
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortOption, setSortOption] = useState("popularity");
  
  const [selectedPanelTypes, setSelectedPanelTypes] = useState<string[]>([]);
  const [selectedInverterTypes, setSelectedInverterTypes] = useState<string[]>([]);
  const [selectedBatteryTypes, setSelectedBatteryTypes] = useState<string[]>([]);

  useEffect(() => {
    if (category) {
      const categoryProducts = getProductsByCategory(category);
      setProducts(categoryProducts);
      setFilteredProducts(categoryProducts);
      
      setSearchQuery("");
      setPriceRange([0, 10000]);
      setSortOption("popularity");
      setSelectedPanelTypes([]);
      setSelectedInverterTypes([]);
      setSelectedBatteryTypes([]);
    }
  }, [category]);

  useEffect(() => {
    let result = [...products];
    
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    if (category === 'panels' && selectedPanelTypes.length > 0) {
      result = result.filter(product => {
        const panelType = product.specifications?.["Cell Type"];
        return typeof panelType === 'string' && selectedPanelTypes.some(type => 
          panelType.toLowerCase().includes(type.toLowerCase())
        );
      });
    }

    if (category === 'inverters' && selectedInverterTypes.length > 0) {
      result = result.filter(product => {
        const productName = product.name.toLowerCase();
        return selectedInverterTypes.some(type => {
          if (type === 'string') return productName.includes('string');
          if (type === 'micro') return productName.includes('micro');
          if (type === 'hybrid') return productName.includes('hybrid');
          return false;
        });
      });
    }

    if (category === 'batteries' && selectedBatteryTypes.length > 0) {
      result = result.filter(product => {
        const batteryType = product.specifications?.["Battery Type"];
        return typeof batteryType === 'string' && selectedBatteryTypes.some(type => {
          if (type === 'lfp') return batteryType.toLowerCase().includes('phosphate');
          if (type === 'nmc') return batteryType.toLowerCase().includes('nmc');
          return false;
        });
      });
    }
    
    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // popularity
        break;
    }
    
    setFilteredProducts(result);
  }, [products, searchQuery, priceRange, sortOption, selectedPanelTypes, selectedInverterTypes, selectedBatteryTypes, category]);

  const getCategoryTitle = () => {
    switch (category) {
      case "panels":
        return lang === "ar" ? "ألواح شمسية" : "Solar Panels";
      case "inverters":
        return lang === "ar" ? "محولات" : "Inverters";
      case "batteries":
        return lang === "ar" ? "بطاريات" : "Batteries";
      case "accessories":
        return lang === "ar" ? "ملحقات" : "Accessories";
      default:
        return lang === "ar" ? "المنتجات" : "Products";
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case "panels":
        return <Sun className="h-6 w-6" />;
      case "inverters":
        return <Package className="h-6 w-6" />;
      case "batteries":
        return <Battery className="h-6 w-6" />;
      default:
        return <Package className="h-6 w-6" />;
    }
  };

  const handlePanelTypeChange = (type: string, checked: boolean) => {
    setSelectedPanelTypes(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const handleInverterTypeChange = (type: string, checked: boolean) => {
    setSelectedInverterTypes(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const handleBatteryTypeChange = (type: string, checked: boolean) => {
    setSelectedBatteryTypes(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  return (
    <div className="container py-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2 mb-8">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          {lang === "ar" ? "الرئيسية" : "Home"}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>{getCategoryTitle()}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {lang === "ar" ? "بحث" : "Search"}
            </h2>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang === "ar" ? "البحث عن المنتجات..." : "Search products..."}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">
              {lang === "ar" ? "نطاق السعر" : "Price Range"}
            </h2>
            <Slider
              defaultValue={priceRange}
              min={0}
              max={10000}
              step={100}
              onValueChange={setPriceRange}
              className="mb-4"
            />
            <div className="flex items-center justify-between">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          {category === "panels" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {lang === "ar" ? "نوع اللوح" : "Panel Type"}
              </h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="monocrystalline" 
                    checked={selectedPanelTypes.includes('monocrystalline')}
                    onCheckedChange={(checked) => handlePanelTypeChange('monocrystalline', checked as boolean)}
                  />
                  <Label htmlFor="monocrystalline">
                    {lang === "ar" ? "أحادي البلورية" : "Monocrystalline"}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="polycrystalline" 
                    checked={selectedPanelTypes.includes('polycrystalline')}
                    onCheckedChange={(checked) => handlePanelTypeChange('polycrystalline', checked as boolean)}
                  />
                  <Label htmlFor="polycrystalline">Polycrystalline</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="flexible" 
                    checked={selectedPanelTypes.includes('flexible')}
                    onCheckedChange={(checked) => handlePanelTypeChange('flexible', checked as boolean)}
                  />
                  <Label htmlFor="flexible">Flexible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="bifacial" 
                    checked={selectedPanelTypes.includes('bifacial')}
                    onCheckedChange={(checked) => handlePanelTypeChange('bifacial', checked as boolean)}
                  />
                  <Label htmlFor="bifacial">Bifacial</Label>
                </div>
              </div>
            </div>
          )}

          {category === "inverters" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Inverter Type</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="string" 
                    checked={selectedInverterTypes.includes('string')}
                    onCheckedChange={(checked) => handleInverterTypeChange('string', checked as boolean)}
                  />
                  <Label htmlFor="string">String Inverters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="micro" 
                    checked={selectedInverterTypes.includes('micro')}
                    onCheckedChange={(checked) => handleInverterTypeChange('micro', checked as boolean)}
                  />
                  <Label htmlFor="micro">Microinverters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hybrid" 
                    checked={selectedInverterTypes.includes('hybrid')}
                    onCheckedChange={(checked) => handleInverterTypeChange('hybrid', checked as boolean)}
                  />
                  <Label htmlFor="hybrid">Hybrid Inverters</Label>
                </div>
              </div>
            </div>
          )}

          {category === "batteries" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Battery Type</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="lfp" 
                    checked={selectedBatteryTypes.includes('lfp')}
                    onCheckedChange={(checked) => handleBatteryTypeChange('lfp', checked as boolean)}
                  />
                  <Label htmlFor="lfp">Lithium Iron Phosphate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="nmc" 
                    checked={selectedBatteryTypes.includes('nmc')}
                    onCheckedChange={(checked) => handleBatteryTypeChange('nmc', checked as boolean)}
                  />
                  <Label htmlFor="nmc">Lithium NMC</Label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              {filteredProducts.length} {lang === "ar" ? "منتج" : "product"}
              {filteredProducts.length !== 1 && (lang === "ar" ? "ات" : "s")} 
              {lang === "ar" ? " تم العثور عليها" : " found"}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {lang === "ar" ? "ترتيب حسب:" : "Sort by:"}
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border rounded-md p-1 text-sm"
              >
                <option value="popularity">
                  {lang === "ar" ? "الشعبية" : "Popularity"}
                </option>
                <option value="price-low">
                  {lang === "ar" ? "السعر: من الأقل إلى الأعلى" : "Price: Low to High"}
                </option>
                <option value="price-high">
                  {lang === "ar" ? "السعر: من الأعلى إلى الأقل" : "Price: High to Low"}
                </option>
                <option value="newest">
                  {lang === "ar" ? "الأحدث" : "Newest"}
                </option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2">
                {lang === "ar" ? "لم يتم العثور على منتجات" : "No products found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {lang === "ar" 
                  ? "حاول تعديل معايير البحث أو التصفية" 
                  : "Try adjusting your search or filter criteria"}
              </p>
              <Button onClick={() => {
                setSearchQuery("");
                setPriceRange([0, 10000]);
              }}>
                {lang === "ar" ? "إعادة تعيين الفلاتر" : "Reset Filters"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full p-6"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                      <Button asChild>
                        <Link to={`/product/${product.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
