/**
 * Content Security Policy configuration
 * 
 * This module provides CSP directives that balance security and functionality
 * for the Solar Glow application.
 */

export const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'], // Allow eval for libraries that need it
  'connect-src': ["'self'", 'https://*.supabase.co', 'https://*.supabase.in', 'wss://*.supabase.co'], // For Supabase connections
  'img-src': ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://*.supabase.co', 'https://placehold.co'], // Common image sources
  'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com'], // For inline styles and external stylesheets
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'frame-ancestors': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
};

/**
 * Generate a CSP header string from the directives
 */
export function generateCspHeader(): string {
  return Object.entries(cspDirectives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}
