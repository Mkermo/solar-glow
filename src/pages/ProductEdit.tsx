import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ProductImageUpload } from "@/components/ProductImageUpload";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching product",
        description: error.message
      });
      return;
    }

    setProduct(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating product",
        description: error.message
      });
      return;
    }

    toast({
      title: "Product updated",
      description: "Changes saved successfully"
    });
    // Redirect to dashboard immediately for better UX
    navigate('/dashboard');
  };

  const handleImageUpdate = (newUrl: string | null) => {
    console.log("Image updated with new URL:", newUrl);
    setProduct(prev => ({
      ...prev,
      image_url: newUrl
    }));
    
    toast({
      title: newUrl ? "Image Updated" : "Image Removed",
      description: newUrl ? "Product image has been updated" : "Product image has been removed"
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      
      {product && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <ProductImageUpload
            productId={product.id}
            currentImageUrl={product.image_url}
            onImageUpdate={handleImageUpdate}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">English Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Name (English)</label>
                <Input
                  value={product.name || ''}
                  onChange={e => setProduct({ ...product, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description (English)</label>
                <textarea
                  className="w-full border rounded-md p-2 min-h-[100px]"
                  value={product.description || ''}
                  onChange={e => setProduct({ ...product, description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Arabic Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Name (Arabic)</label>
                <Input
                  value={product.name_ar || ''}
                  onChange={e => setProduct({ ...product, name_ar: e.target.value })}
                  required
                  dir="rtl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description (Arabic)</label>
                <textarea
                  className="w-full border rounded-md p-2 min-h-[100px]"
                  value={product.description_ar || ''}
                  onChange={e => setProduct({ ...product, description_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-4 col-span-1 md:col-span-2">
              <h2 className="text-lg font-semibold">Product Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <Input
                    type="number"
                    value={product.price || 0}
                    onChange={e => setProduct({ ...product, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <Input
                    type="number"
                    value={product.stock_quantity || 0}
                    onChange={e => setProduct({ ...product, stock_quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <Button type="submit" className="w-full md:w-auto">Save Changes</Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
