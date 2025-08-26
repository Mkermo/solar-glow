import { supabase } from '@/lib/supabase';

/**
 * Create necessary database tables for forum functionality if they don't exist
 */
export const initializeForumTables = async () => {
  // This is just a check function to log database errors
  // We can't actually create tables via RLS as that requires admin privileges
  
  console.log('Checking forum tables structure...');
  
  try {
    const missingTables = [];
    const results = {
      categories: { exists: false, count: 0 },
      topics: { exists: false, count: 0 },
      comments: { exists: false, count: 0, alternateExists: false }
    };
    
    // Check forum_categories table
    const { count: catCount, error: catError } = await supabase
      .from('forum_categories')
      .select('*', { count: 'exact', head: true });
      
    if (catError) {
      console.error('Error checking forum_categories table:', catError);
      missingTables.push('forum_categories');
    } else {
      console.log(`Found ${catCount} forum categories`);
      results.categories = { exists: true, count: catCount || 0 };
    }
    
    // Check forum_topics table
    const { count: topicsCount, error: topicsError } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true });
      
    if (topicsError) {
      console.error('Error checking forum_topics table:', topicsError);
      missingTables.push('forum_topics');
    } else {
      console.log(`Found ${topicsCount} forum topics`);
      results.topics = { exists: true, count: topicsCount || 0 };
      
      if (topicsCount && topicsCount > 0) {
        // Check for view_count vs views column
        try {
          const { data: topic } = await supabase
            .from('forum_topics')
            .select('view_count, views')
            .limit(1);
            
          if (topic && topic.length > 0) {
            if ('view_count' in topic[0]) {
              console.log('Forum topics table has view_count column');
            } else if ('views' in topic[0]) {
              console.log('Forum topics table has views column instead of view_count');
              console.warn('Please update the database to use view_count instead of views');
            }
          }
        } catch (err) {
          console.log('Could not check view count column names');
        }
      }
    }
    
    // Check forum_comments table
    const { count: commentsCount, error: commentsError } = await supabase
      .from('forum_comments')
      .select('*', { count: 'exact', head: true });
      
    if (commentsError) {
      console.error('Error checking forum_comments table:', commentsError);
      missingTables.push('forum_comments');
      
      // Try checking forum_replies as a fallback
      const { count: repliesCount, error: repliesError } = await supabase
        .from('forum_replies')
        .select('*', { count: 'exact', head: true });
        
      if (!repliesError) {
        console.log(`Found ${repliesCount} forum replies instead of comments`);
        console.warn('Your database is using forum_replies instead of forum_comments. Please run the SQL setup script.');
        results.comments.alternateExists = true;
      }
    } else {
      console.log(`Found ${commentsCount} forum comments`);
      results.comments = { 
        exists: true, 
        count: commentsCount || 0,
        alternateExists: false
      };
    }
    
    console.log('Forum tables check results:', results);
    
    if (missingTables.length > 0) {
      return {
        success: false,
        missingTables,
        results
      };
    }
    
    // Everything is good
    console.log('Forum tables structure verified successfully');
    return {
      success: true,
      results
    };
    
  } catch (error) {
    console.error('Error checking forum tables:', error);
    return {
      success: false,
      error
    };
  }
};

// Forum tables structure for reference
/*
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_sticky BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true
);
*/
