import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  sold_quantity: number;
  is_hidden: boolean;
  is_on_sale: boolean;
  category: string;
  specifications: Record<string, string>;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("panels");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = [
    { id: "panels", name: "Solar Panels" },
    { id: "inverters", name: "Inverters" },
    { id: "batteries", name: "Batteries" },
    { id: "accessories", name: "Accessories" }
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', selectedCategory)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Error fetching products",
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleHidden = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_hidden: !product.is_hidden })
      .eq('id', product.id);

    if (error) {
      toast({ 
        variant: "destructive",
        title: "Error updating product",
        description: error.message 
      });
      return;
    }

    await fetchProducts(); // Refresh products list
    toast({
      title: "Success",
      description: `Product ${product.is_hidden ? 'shown' : 'hidden'}`
    });
  };

  const handleImageUpload = async (productId: string, file: File) => {
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Update product with new image URL
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', productId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Image updated successfully"
      });

      // Refresh products list
      fetchProducts();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image"
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={() => navigate('/dashboard/add-product')}>
          Add New Product
        </Button>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="mb-4">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className={`p-4 border rounded-lg ${product.is_hidden ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-500">
                          Stock: {product.stock_quantity} | Sold: {product.sold_quantity}
                        </p>
                        <p className="text-sm font-medium">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => toggleHidden(product)}
                      >
                        {product.is_hidden ? 'Show' : 'Hide'}
                      </Button>

                      <label className="cursor-pointer inline-block">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(product.id, file);
                          }}
                        />
                        <Button variant="outline" type="button">
                          Change Photo
                        </Button>
                      </label>

                      <Button
                        variant="default"
                        onClick={() => navigate(`/dashboard/product/${product.id}`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}