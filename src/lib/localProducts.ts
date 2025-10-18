// This file is deprecated and should not be used anymore.
// Products should be fetched directly from Supabase instead.

import { supabase } from './supabase';

// For backward compatibility
export interface LocalProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category: string;
}

/**
 * Check if products exist in the database
 */
export async function hasLocalProducts(): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return (count ?? 0) > 0;
  } catch (err) {
    console.error('Failed to check products:', err);
    return false;
  }
}

/**
 * Get products directly from Supabase
 */
export async function getLocalProducts(): Promise<LocalProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to get products:', err);
    return [];
  }
}

