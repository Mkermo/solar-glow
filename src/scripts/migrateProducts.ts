import { createClient } from '@supabase/supabase-js'
import { products } from '../data/products.js'

// Initialize Supabase client with your actual credentials
const supabase = createClient(
  'https://ketesbnrumxbvwuaqefa.supabase.co',  // Replace with your Project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldGVzYm5ydW14YnZ3dWFxZWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDg1ODcsImV4cCI6MjA2MjUyNDU4N30._E9BrV3rNrzz-cDvbUoyUkbcuhW-95rDANA2nnheEFc'  // Replace with your actual anon key (starts with eyJ)
)

async function migrateProducts() {
  try {
    // First authenticate as admin
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: 'm@sg.com',  // Replace with your admin email
      password: 'mker123123123'  // Replace with your admin password
    })

    if (authError) {
      console.error('Authentication error:', authError)
      return
    }

    console.log('Authenticated successfully')
    
    // First, delete all existing products
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '')

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return
    }

    console.log('Existing products deleted')

    // Insert new products with batch processing
    const batchSize = 50
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        image_url: p.image || '/placeholder.svg',
        stock_quantity: 50,
        specifications: p.specifications,
        sold_quantity: 0,
        is_hidden: false,
        is_on_sale: false
      }))

      const { error: insertError } = await supabase
        .from('products')
        .insert(batch)

      if (insertError) {
        console.error(`Insert error at batch ${i/batchSize + 1}:`, insertError)
        return
      }
      console.log(`Inserted batch ${i/batchSize + 1}`)
    }

    console.log('Products migrated successfully')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Run migration
migrateProducts().catch(console.error)