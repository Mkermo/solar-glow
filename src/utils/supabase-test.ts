import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
} else {
  console.log('Supabase URL:', supabaseUrl)
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Test connection and storage
  async function testSupabase() {
    try {
      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('_test')
        .select('*')
        .limit(1)
      
      if (dbError) throw dbError
      console.log('Database connection: OK')

      // Test storage bucket
      const { data: bucketTest, error: storageError } = await supabase
        .storage
        .getBucket('product-images')
      
      if (storageError) throw storageError
      console.log('Storage bucket: OK')

    } catch (error) {
      console.error('Test failed:', error)
    }
  }

  testSupabase()
}