import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductImageUpload } from "@/components/ProductImageUpload";
import { Edit, Trash2, Plus } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const ProductManagement = () => {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching products for management");

      // Skip the connection test in production
      // Directly fetch the needed product data with optimized query
      const { data, error } = await supabase
        .from('products')
        .select('id, name, name_ar, category, price, stock_quantity, image_url')
        .order('category', { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} products for management`);
      setProducts(data || []);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to load products"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = async (productId: string, newImageUrl: string) => {
    try {
      // Update the product with the new image URL
      const { error } = await supabase
        .from('products')
        .update({ image_url: newImageUrl })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId ? { ...product, image_url: newImageUrl } : product
        )
      );

      toast({
        title: "Image Updated",
        description: "Product image has been updated successfully"
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update image"
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully"
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete product"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getProductName = (product: any) => {
    return lang === 'ar' && product.name_ar ? product.name_ar : product.name;
  };

  return (
    <div className="space-y-6">
      <ScrollReveal>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {t("Product Management", "إدارة المنتجات")}
          </h1>
          <Button asChild>
            <Link to="/add-product">
              <Plus className="mr-2 h-4 w-4" />
              {t("Add Product", "إضافة منتج")}
            </Link>
          </Button>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4">{t("Loading products...", "جاري تحميل المنتجات...")}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-muted/20">
            <p className="text-lg">{t("No products found", "لم يتم العثور على منتجات")}</p>
            <p className="mt-2 text-gray-500">
              {t("Add your first product by clicking the button above", "أضف أول منتج لك بالنقر على الزر أعلاه")}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Image", "الصورة")}</TableHead>
                  <TableHead>{t("Name", "الاسم")}</TableHead>
                  <TableHead>{t("Category", "الفئة")}</TableHead>
                  <TableHead>{t("Price", "السعر")}</TableHead>
                  <TableHead>{t("Stock", "المخزون")}</TableHead>
                  <TableHead className="text-right">{t("Actions", "الإجراءات")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <ProductImageUpload
                        productId={product.id}
                        currentImageUrl={product.image_url || '/placeholder.svg'}
                        onImageUpdate={(newUrl) => handleImageUpdate(product.id, newUrl)}
                        showChangeButton={false}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{product.name_ar}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {t(
                        product.category.charAt(0).toUpperCase() + product.category.slice(1),
                        product.category === 'panels' ? 'ألواح شمسية' :
                        product.category === 'inverters' ? 'عواكس' :
                        product.category === 'batteries' ? 'بطاريات' : 'إكسسوارات'
                      )}
                    </TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/edit-product/${product.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deletingId === product.id}
                        >
                          {deletingId === product.id ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ScrollReveal>
    </div>
  );
};

export default ProductManagement;
