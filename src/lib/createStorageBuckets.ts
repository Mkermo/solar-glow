// Create storage buckets for forum functionality
import { supabase } from './supabase';

export async function createRequiredStorageBuckets() {
  console.log('Checking and creating required storage buckets...');
  
  const requiredBuckets = [
    'products',
    'avatars',
    'forum-attachments'
  ];
  
  const missingBuckets = [];
  
  // Check which buckets exist
  for (const bucketName of requiredBuckets) {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error) {
      console.log(`Bucket ${bucketName} not found, will create it`);
      missingBuckets.push(bucketName);
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }
  }
  
  // Create missing buckets
  const results = {};
  for (const bucketName of missingBuckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: bucketName === 'products', // Only make products bucket public
        fileSizeLimit: bucketName === 'forum-attachments' ? 10485760 : 5242880, // 10MB for forum, 5MB for others
      });
      
      results[bucketName] = error ? `Error: ${error.message}` : 'Created successfully';
    } catch (err) {
      console.error(`Error creating bucket ${bucketName}:`, err);
      results[bucketName] = `Error: ${err.message || 'Unknown error'}`;
    }
  }
  
  return {
    missingBuckets,
    results,
    success: missingBuckets.length === 0 || Object.values(results).every(r => !r.startsWith('Error'))
  };
}

export default createRequiredStorageBuckets;
