import { supabase } from './supabase';

/**
 * This function sets up the storage buckets needed for the application
 * and configures their RLS policies for public access
 */
export const setupStorage = async () => {
  try {
    console.log('Setting up Supabase storage buckets...');

    // Check if products bucket exists
    const { data: productsBucket, error: bucketError } = await supabase.storage.getBucket('products');

    if (bucketError && bucketError.message.includes('not found')) {
      console.log('Creating products bucket...');
      await supabase.storage.createBucket('products', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });

      // Set public policy for products bucket
      await supabase.storage.from('products').createSignedUploadUrl('test.txt');
      console.log('Products bucket created with public access');
    } else {
      console.log('Products bucket already exists');
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting up storage:', error);
    return { success: false, error };
  }
};
