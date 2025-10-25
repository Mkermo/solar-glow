import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductImageUploadProps {
  productId: string;
  currentImageUrl: string | null;
  onImageUpdate: (newUrl: string | null) => void;
  showChangeButton?: boolean;
}

export function ProductImageUpload({ 
  productId, 
  currentImageUrl, 
  onImageUpdate,
  showChangeButton = true 
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const directFileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Create a unique ID for each input to avoid conflicts
  const inputId = `imageUpload-${productId}`;
  
  // Handle direct file upload
  // Handle image upload from file input
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Image upload triggered");
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    await handleFileUpload(file);
  };

  // Handle direct URL input submission
  const handleUrlSubmit = () => {
    if (!imageUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a valid image URL",
        variant: "destructive"
      });
      return;
    }

    try {
      // Validate URL
      new URL(imageUrl);
      
      // Update with the provided URL
      onImageUpdate(imageUrl);
      setDialogOpen(false);
      setImageUrl('');
      
      toast({
        title: "Image updated",
        description: "The product image was updated successfully with the provided URL."
      });
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive"
      });
    }
  };
  
  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      console.log("Starting upload for file:", file.name);

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
      console.log("File will be uploaded as:", fileName);
      
      // First check if the bucket exists, create if needed
      const { data: bucketData, error: bucketError } = await supabase.storage
        .getBucket('products');
        
      if (bucketError && bucketError.message.includes('not found')) {
        console.log("Creating products bucket");
        await supabase.storage.createBucket('products', {
          public: true
        });
      }

      // Upload to Supabase Storage
      console.log("Uploading to Supabase...");
      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
      
      console.log("Upload successful:", data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);
      
      console.log("Public URL generated:", publicUrl);

      // Update product record
      console.log("Updating product record with new image URL");
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', productId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error(`Failed to update product image: ${updateError.message}`);
      }

      console.log("Product updated successfully");
      onImageUpdate(publicUrl);
      setDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Product image updated successfully"
      });
      
      // Reset the file input so it can be selected again
      const fileInput = document.getElementById(inputId) as HTMLInputElement;
      if (fileInput) fileInput.value = '';

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

  const extractStoragePath = (url: string) => {
    const marker = "/storage/v1/object/public/products/";
    const index = url.indexOf(marker);
    if (index === -1) return null;
    const pathWithQuery = url.substring(index + marker.length);
    return pathWithQuery.split("?")[0];
  };

  const handleDeleteImage = async () => {
    if (!currentImageUrl) {
      toast({
        title: "No image to delete",
        description: "This product does not have an image assigned yet."
      });
      return;
    }

    try {
      setDeleting(true);

      const storagePath = extractStoragePath(currentImageUrl);
      if (storagePath) {
        const { error: storageError } = await supabase
          .storage
          .from('products')
          .remove([storagePath]);

        if (storageError) {
          console.error('Storage delete error:', storageError);
          throw new Error(`Failed to remove stored image: ${storageError.message}`);
        }
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: null })
        .eq('id', productId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error(`Failed to update product image: ${updateError.message}`);
      }

      onImageUpdate(null);
      setDialogOpen(false);
      toast({
        title: "Image removed",
        description: "Product image deleted successfully"
      });
    } catch (error) {
      console.error('Delete image error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete image"
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
        <img
          src={currentImageUrl || '/placeholder.svg'}
          alt="Product"
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
      </div>
      {showChangeButton && (
        <div className="space-y-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                disabled={uploading} 
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>Update Image</>
                )}
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Product Image</DialogTitle>
                <DialogDescription>
                  Choose how you want to update the product image.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="url">Enter URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 space-y-2">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-500">Upload an image file</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id={inputId}
                      name={inputId}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Button 
                      type="button"
                      variant="secondary" 
                      disabled={uploading}
                      className="cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="imageUrl" className="text-sm font-medium">
                        Image URL
                      </label>
                      <Input
                        id="imageUrl"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Enter the direct URL to an image file
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleUrlSubmit} className="w-full">
                    Use this URL
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
         
          {/* Keep the original file input for compatibility */}
          <div className="hidden">
            <input
              ref={directFileInputRef}
              type="file"
              id={`direct-${inputId}`}
              name={`direct-${inputId}`}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              disabled={uploading}
              className="cursor-pointer w-full"
              onClick={() => directFileInputRef.current?.click()}
            >
              Upload File Directly
            </Button>
          </div>
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            disabled={uploading || deleting}
            onClick={handleDeleteImage}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Image
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
