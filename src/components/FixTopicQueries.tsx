import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

// This component will fix the issues with category topics
const FixTopicQueries = () => {
  useEffect(() => {
    // Function to fetch category topics without using joins
    const fetchAndFixCategoryTopics = async () => {
      try {
        // 1. Get all categories
        const { data: categories, error: catError } = await supabase
          .from('forum_categories')
          .select('*');
          
        if (catError) {
          console.error("Error fetching categories:", catError);
          return;
        }
        
        // 2. Process each category
        for (const category of categories) {
          // First check if there are any topics for this category
          const { data: topics, error: topicsError } = await supabase
            .from('forum_topics')
            .select('*')
            .eq('category_id', category.id)
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(3);
            
          if (topicsError) {
            console.error(`Error fetching topics for category ${category.id}:`, topicsError);
            continue;
          }
          
          if (topics && topics.length > 0) {
            console.log(`Found ${topics.length} topics for category ${category.name}`);
            
            // Get user IDs from the topics
            const userIds = [...new Set(topics.map(topic => topic.user_id))];
            
            // Fetch user profiles in a single query
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, username, avatar_url, email')
              .in('id', userIds);
              
            if (profilesError) {
              console.error("Error fetching profiles:", profilesError);
              continue;
            }
            
            // Map profiles by ID for easy lookup
            const profileMap = {};
            if (profiles) {
              profiles.forEach(profile => {
                profileMap[profile.id] = profile;
              });
            }
            
            // Enhance topics with profile information
            const enhancedTopics = topics.map(topic => ({
              ...topic,
              profiles: profileMap[topic.user_id] || null
            }));
            
            console.log(`Enhanced topics for category ${category.name}:`, enhancedTopics);
          } else {
            console.log(`No topics found for category ${category.name}`);
          }
        }
        
        console.log("Finished checking and fixing topic queries");
      } catch (err) {
        console.error("Error in fixing topic queries:", err);
      }
    };
    
    fetchAndFixCategoryTopics();
  }, []);
  
  return null; // This component doesn't render anything
};

export default FixTopicQueries;
