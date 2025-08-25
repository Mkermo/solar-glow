import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, ArrowLeft, Heart, Share2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductImageUpload } from '@/components/ProductImageUpload';
import ScrollReveal from '@/components/ScrollReveal';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Clean ID (no -ar suffix)
  const cleanId = id?.replace('-ar', '');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading product with ID:', cleanId);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', cleanId)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          setError(error.message);
          return;
        }
        
        if (!data) {
          console.error('Product not found');
          setError('Product not found');
          return;
        }
        
        console.log('Loaded product data:', data);
        setProduct(data);
      } catch (err: any) {
        console.error('Error loading product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (cleanId) {
      loadProduct();
    }
  }, [cleanId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast({
      title: t("Added to Cart", "تمت الإضافة إلى السلة"),
      description: t(
        `${product.name} has been added to your cart`, 
        `تمت إضافة ${product.name_ar || product.name} إلى سلة التسوق`
      ),
    });
  };

  // Get product name based on language
  const getProductName = () => {
    if (!product) return '';
    return lang === 'ar' && product.name_ar ? product.name_ar : product.name;
  };
  
  // Get product description based on language
  const getProductDescription = () => {
    if (!product) return '';
    return lang === 'ar' && product.description_ar ? product.description_ar : product.description;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-4">{t("Loading...", "جاري التحميل...")}</p>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("Product Not Found", "المنتج غير موجود")}</h1>
        <p className="text-gray-500 mb-8">{error || t("The requested product could not be found", "تعذر العثور على المنتج المطلوب")}</p>
        <Button asChild>
          <Link to={`/products/${product?.category || 'all'}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Back to Products", "العودة للمنتجات")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Product navigation */}
      <div className="mb-6">
        <Link to={`/products/${product.category}`} className="text-sm text-gray-500 hover:text-primary">
          {t("Products", "المنتجات")} &gt; {t(
            product.category.charAt(0).toUpperCase() + product.category.slice(1),
            product.category === 'panels' ? 'الألواح الشمسية' :
            product.category === 'inverters' ? 'المحولات' :
            product.category === 'batteries' ? 'البطاريات' :
            product.category === 'accessories' ? 'الملحقات' :
            'منتجات'
          )}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image section */}
        <ScrollReveal>
          <div>
            <div className="border rounded-lg p-4 bg-white">
              <ProductImageUpload
                productId={product.id}
                currentImageUrl={product.image_url}
                onImageUpdate={() => {}}
                showChangeButton={false}
              />
            </div>
          </div>
        </ScrollReveal>
        
        {/* Content section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">
            {getProductName()}
          </h1>

          <p className="text-gray-600">
            {getProductDescription()}
          </p>

          <div className="text-2xl font-bold">
            <span className="text-gray-600 text-base mr-2">{t("Price:", "السعر:")}</span>
            ${product.price?.toFixed(2) || "0.00"}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">{t("Quantity:", "الكمية:")}</span>
            <div className="flex items-center border rounded-md">
              <button 
                className="px-3 py-1 border-r hover:bg-muted" 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center p-1 border-none focus:outline-none"
              />
              <button 
                className="px-3 py-1 border-l hover:bg-muted" 
                onClick={() => setQuantity(q => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t("Add to Cart", "أضف إلى السلة")}
            </Button>
            
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Product details tabs */}
          <Tabs defaultValue="specifications" className="mt-8">
            <TabsList>
              <TabsTrigger value="specifications">
                {t("Specifications", "المواصفات")}
              </TabsTrigger>
              <TabsTrigger value="features">
                {t("Features", "الميزات")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="specifications" className="pt-4">
              {product.specifications ? (
                <dl className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => {
                    // Get translated key/value if available
                    let displayKey = key;
                    let displayValue = value;
                    
                    if (lang === 'ar' && product.specifications_ar) {
                      const arSpecs = product.specifications_ar;
                      const arKeys = Object.keys(arSpecs);
                      const arValues = Object.values(arSpecs);
                      const index = Object.keys(product.specifications).indexOf(key);
                      
                      if (index >= 0 && arKeys[index]) {
                        displayKey = arKeys[index];
                        displayValue = arValues[index];
                      }
                    }
                    
                    return (
                      <div key={key} className="flex flex-col">
                        <dt className="text-gray-600">{displayKey}</dt>
                        <dd className="font-medium">{String(displayValue)}</dd>
                      </div>
                    );
                  })}
                </dl>
              ) : (
                <p>{t("No specifications available", "لا توجد مواصفات متاحة")}</p>
              )}
            </TabsContent>
            <TabsContent value="features" className="pt-4">
              {product.features ? (
                <ul className="list-disc list-inside space-y-2">
                  {product.features.map((feature, index) => {
                    // Get translated feature if available
                    let displayFeature = feature;
                    
                    if (lang === 'ar' && product.features_ar && product.features_ar[index]) {
                      displayFeature = product.features_ar[index];
                    }
                    
                    return <li key={index}>{displayFeature}</li>;
                  })}
                </ul>
              ) : (
                <p>{t("No features available", "لا توجد ميزات متاحة")}</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
