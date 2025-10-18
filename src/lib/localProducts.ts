/**
 * Manual Database Initialization
 * 
 * This module provides direct product creation bypassing database tables
 * using localStorage as a fallback when Supabase is unavailable or lacking permissions.
 */

import { sampleProducts } from './productUtils';

// Store products in localStorage
export const initializeLocalProducts = () => {
  try {
    // Save products to localStorage
    localStorage.setItem('solar-glow-products', JSON.stringify(sampleProducts));
    console.log('Products saved to localStorage');
    return true;
  } catch (err) {
    console.error('Failed to save products to localStorage:', err);
    return false;
  }
};

// Get products from localStorage
export const getLocalProducts = () => {
  try {
    const products = localStorage.getItem('solar-glow-products');
    if (products) {
      return JSON.parse(products);
    }
    return [];
  } catch (err) {
    console.error('Failed to get products from localStorage:', err);
    return [];
  }
};

// Check if products exist in localStorage
export const hasLocalProducts = () => {
  try {
    const products = localStorage.getItem('solar-glow-products');
    return !!products;
  } catch (err) {
    return false;
  }
};

// Clear products from localStorage
export const clearLocalProducts = () => {
  try {
    localStorage.removeItem('solar-glow-products');
    return true;
  } catch (err) {
    console.error('Failed to clear products from localStorage:', err);
    return false;
  }
};