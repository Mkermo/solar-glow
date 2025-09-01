import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Default categories to create (sanitized)
const defaultCategories = [
  {
    name: 'General Discussion',
    description: 'General discussions about solar energy'
  },
  {
    name: 'Product Questions',
    description: 'Questions about solar products'
  },
  {
    name: 'Installation Help',
    description: 'Help with solar panel installation'
  },
  {
    name: 'Troubleshooting',
    description: 'Get help with troubleshooting your solar system'
  }
];

/**
 * Creates default forum categories if none exist.
 */
const ForumCategoriesInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCategories = async () => {
      try {
        // First check if any categories exist
        const { data: existingCategories, error: countError } = await supabase
          .from('forum_categories')
          .select('id')
          .limit(1);

        if (countError) {
          console.error('Error checking categories:', countError);
          setError('Failed to check if categories exist');
          return;
        }

        if (existingCategories && existingCategories.length > 0) {
          console.log('Forum categories already exist');
          setInitialized(true);
          return;
        }

        console.log('No forum categories found, creating defaults...');

        const { error: insertError } = await supabase
          .from('forum_categories')
          .insert(defaultCategories);

        if (insertError) {
          console.error('Error creating categories:', insertError);
          setError('Failed to create default categories');
          return;
        }

        setInitialized(true);
      } catch (err) {
        console.error('Unexpected error initializing categories:', err);
        setError('An unexpected error occurred');
      }
    };

    if (!initialized && !error) {
      initializeCategories();
    }
  }, [initialized, error]);

  // This component doesn't render anything visible
  return null;
};

export default ForumCategoriesInitializer;

