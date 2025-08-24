import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ProductImageUploadProps {
  productId: string;
  currentImageUrl: string | null;
  onImageUpdate: (newUrl: string) => void;
}

export function ProductImageUpload({ productId, currentImageUrl, onImageUpdate }: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be smaller than 5MB');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // Update product record
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', productId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to update product image');
      }

      onImageUpdate(publicUrl);
      
      toast({
        title: "Success",
        description: "Product image updated successfully"
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update image"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
        <img 
          src={currentImageUrl || '/placeholder-product.png'} 
          alt="Product" 
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <input
          type="file"
          id="imageUpload"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
        />
        <label htmlFor="imageUpload">
          <Button 
            type="button"
            variant="outline" 
            disabled={uploading}
            className="cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Change Photo'
            )}
          </Button>
        </label>
      </div>
    </div>
  );
}