import { supabase } from './supabase';

/**
 * This function checks if the required storage buckets exist
 * and provides guidance if they don't
 * 
 * NOTE: Creating buckets requires admin privileges and should typically
 * be done through the Supabase dashboard by an administrator
 */
export const setupStorage = async () => {
  try {
    console.log('Checking Supabase storage buckets...');

    // List of required buckets
    const requiredBuckets = ['products', 'avatars', 'forum-attachments'];
    
    // Check if buckets exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      // Don't treat this as a fatal error, just continue
      console.warn("Unable to check storage buckets - application will continue but file uploads may not work");
      return { success: true, warnings: ["Unable to verify storage buckets"] };
    }

    // Check which buckets exist and which are missing
    const existingBuckets = buckets?.map(bucket => bucket.name) || [];
    const missingBuckets = requiredBuckets.filter(name => !existingBuckets.includes(name));
    
    if (missingBuckets.length > 0) {
      console.warn(`Missing required storage buckets: ${missingBuckets.join(', ')}`);
      console.warn("Please create these buckets in the Supabase dashboard");
      
      return { 
        success: true, 
        warnings: [`Missing buckets: ${missingBuckets.join(', ')}. Create them in your Supabase dashboard.`] 
      };
    }
    
    console.log("All required storage buckets exist");
    return { success: true };
  } catch (error) {
    console.error('Error checking storage buckets:', error);
    // Don't treat this as a fatal error
    return { success: true, warnings: ["Error checking storage buckets"] };
  }
};

// No helper function needed in the new approach
