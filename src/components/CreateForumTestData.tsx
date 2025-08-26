import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getTopicCommentCount } from '@/lib/forumUtils';

/**
 * Component to create default forum categories for testing
 * Only meant to be used in development
 */
const CreateForumTestData = () => {
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const createTestData = async () => {
      try {
        console.log('Checking for existing categories...');
        
        // Check if categories already exist
        const { data: existingCategories, error: checkError } = await supabase
          .from('forum_categories')
          .select('id, name')
          .limit(1);
          
        if (checkError) {
          console.error('Error checking categories:', checkError);
          setMessage('Error checking categories: ' + checkError.message);
          return;
        }
        
        // If categories exist, don't create test data
        if (existingCategories && existingCategories.length > 0) {
          console.log('Categories already exist, not creating test data');
          setMessage(`Found ${existingCategories.length} existing categories. No test data created.`);
          return;
        }
        
        // Create sample categories
        const categories = [
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
          }
        ];
        
        console.log('Creating sample categories...');
        const { data: createdCategories, error: createError } = await supabase
          .from('forum_categories')
          .insert(categories)
          .select();
          
        if (createError) {
          console.error('Error creating categories:', createError);
          setMessage('Error creating categories: ' + createError.message);
          return;
        }
        
        console.log('Created categories:', createdCategories);
        setMessage(`Successfully created ${createdCategories?.length || 0} test categories`);
        
        // Return if no categories were created
        if (!createdCategories || createdCategories.length === 0) {
          return;
        }
        
        // Get the current user (if any)
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No authenticated user, skipping topic creation');
          return;
        }
        
        // Create a sample topic in each category
        const sampleTopics = createdCategories.map((category, index) => ({
          title: `Sample Topic ${index + 1}`,
          content: `This is a sample topic in the ${category.name} category. It's automatically created for testing purposes.`,
          user_id: user.id,
          category_id: category.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          view_count: Math.floor(Math.random() * 50),
          is_approved: true
        }));
        
        console.log('Creating sample topics...');
        const { data: createdTopics, error: topicError } = await supabase
          .from('forum_topics')
          .insert(sampleTopics)
          .select();
          
        if (topicError) {
          console.error('Error creating topics:', topicError);
          setMessage(`Created categories but failed to create topics: ${topicError.message}`);
          return;
        }
        
        console.log('Created topics:', createdTopics);
        setMessage(`Successfully created ${createdCategories.length} test categories and ${createdTopics?.length || 0} sample topics`);
        
      } catch (err) {
        console.error('Unexpected error creating test data:', err);
        setMessage('Unexpected error: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    
    createTestData();
  }, []);
  
  // This component doesn't render anything visible
  return null;
};

export default CreateForumTestData;
