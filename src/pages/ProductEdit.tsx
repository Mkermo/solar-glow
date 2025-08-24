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
    navigate('/dashboard');
  };

  const handleImageUpdate = (newUrl: string) => {
    setProduct(prev => ({
      ...prev,
      image_url: newUrl
    }));
    
    // Force a re-fetch to ensure we have the latest data
    fetchProduct();
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
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={product.name}
                onChange={e => setProduct({ ...product, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <Input
                type="number"
                value={product.price}
                onChange={e => setProduct({ ...product, price: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <Input
                type="number"
                value={product.stock_quantity}
                onChange={e => setProduct({ ...product, stock_quantity: e.target.value })}
              />
            </div>

            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      )}
    </div>
  );
}