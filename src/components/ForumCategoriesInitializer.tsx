import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Default categories to create
const defaultCategories = [
  {
    name: 'General Discussion',
    name_ar: 'مناقشة عامة',
    description: 'General discussions about solar energy',
    description_ar: 'مناقشات عامة حول الطاقة الشمسية'
  },
  {
    name: 'Product Questions',
    name_ar: 'أسئلة المنتجات',
    description: 'Questions about solar products',
    description_ar: 'أسئلة حول منتجات الطاقة الشمسية'
  },
  {
    name: 'Installation Help',
    name_ar: 'مساعدة في التركيب',
    description: 'Help with solar panel installation',
    description_ar: 'مساعدة في تركيب الألواح الشمسية'
  },
  {
    name: 'Troubleshooting',
    name_ar: 'استكشاف الأخطاء وإصلاحها',
    description: 'Get help with troubleshooting your solar system',
    description_ar: 'الحصول على مساعدة في استكشاف أخطاء نظام الطاقة الشمسية وإصلاحها'
  }
];

/**
 * This component creates default forum categories if none exist
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

        // If categories already exist, we're done
        if (existingCategories && existingCategories.length > 0) {
          console.log('Forum categories already exist');
          setInitialized(true);
          return;
        }

        console.log('No forum categories found, creating defaults...');
        
        // Insert default categories
        const { data, error: insertError } = await supabase
          .from('forum_categories')
          .insert(defaultCategories)
          .select();

        if (insertError) {
          console.error('Error creating categories:', insertError);
          setError('Failed to create default categories');
          return;
        }

        console.log('Default forum categories created:', data);
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
