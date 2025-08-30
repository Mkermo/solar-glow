import { supabase } from './supabase';

// Cache for view count column name
let viewCountColumnCache = null;

// Function to increment view count for a topic
export const incrementTopicViewCount = async (topicId: string) => {
  if (!topicId) return;
  
  try {
    console.log(`Incrementing view count for topic ${topicId}`);
    
    // Ensure we have a valid session before proceeding
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log('No active session for view count increment - continuing as anonymous');
    }
    
    // Use cached column name or get it from schema adapter
    let viewCountColumn = viewCountColumnCache;
    
    if (!viewCountColumn) {
      try {
        const { adaptToDatabaseSchema } = await import('./schemaAdapter');
        const schemaInfo = await adaptToDatabaseSchema();
        viewCountColumn = schemaInfo.viewCountField;
        viewCountColumnCache = viewCountColumn;
      } catch (err) {
        // Default to view_count if schema adapter fails
        viewCountColumn = 'view_count';
      }
    }
    
    console.log(`Using ${viewCountColumn} column for view counts`);
    
    // Try using RPC for view count increment if available
    try {
      // Attempt to use a server-side function for better performance and reliability
      const { data: rpcResult, error: rpcError } = await supabase.rpc('increment_topic_view', { 
        topic_id: topicId 
      });
      
      // If RPC succeeded, return the new count
      if (!rpcError && rpcResult) {
        console.log(`View count incremented via RPC to ${rpcResult}`);
        return rpcResult;
      }
      
      // If RPC failed or doesn't exist, fall back to manual update
      console.log('Falling back to direct update for view count');
    } catch (err) {
      console.log('RPC not available, using direct update');
    }
    
    // Get the current view count with retry
    let attempt = 0;
    let topic = null;
    let fetchError = null;
    
    while (attempt < 3 && !topic) {
      try {
        const result = await supabase
          .from('forum_topics')
          .select(viewCountColumn)
          .eq('id', topicId)
          .single();
          
        topic = result.data;
        fetchError = result.error;
        
        if (fetchError) {
          console.error(`Error fetching topic view count (attempt ${attempt + 1}):`, fetchError);
          attempt++;
        } else {
          break;
        }
      } catch (err) {
        console.error(`Unexpected error in view count fetch (attempt ${attempt + 1}):`, err);
        attempt++;
      }
    }
    
    if (!topic) {
      console.error('Failed to fetch topic after multiple attempts');
      return;
    }
    
    const currentViewCount = topic ? (topic[viewCountColumn] || 0) : 0;
    const newViewCount = currentViewCount + 1;
    
    // Update the view count with the appropriate column name
    const updateData = viewCountColumn === 'view_count' 
      ? { view_count: newViewCount }
      : { views: newViewCount };
    
    const { error: updateError } = await supabase
      .from('forum_topics')
      .update(updateData)
      .eq('id', topicId);
      
    if (updateError) {
      console.error('Error updating view count:', updateError);
      return;
    }
    
    console.log(`Updated view count for topic ${topicId} to ${newViewCount}`);
    return newViewCount;
  } catch (error) {
    console.error('Unexpected error incrementing view count:', error);
    return;
  }
};

// Get comment count for a topic
export const getTopicCommentCount = async (topicId: string): Promise<number> => {
  if (!topicId) return 0;
  
  try {
    const { count, error } = await supabase
      .from('forum_comments')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId);
      
    if (error) {
      console.error(`Error counting comments for topic ${topicId}:`, error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error(`Error getting comment count for topic ${topicId}:`, error);
    return 0;
  }
};

// Direct SQL for table creation
export const createForumTables = async () => {
  try {
    console.log('Attempting to create forum tables via SQL...');
    
    // Unfortunately, this won't work with default permissions
    // We're only including this as a reference
    const { error } = await supabase.rpc('create_forum_tables');
    
    if (error) {
      console.error('Error creating forum tables (this is expected with regular permissions):', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error creating forum tables:', error);
    return false;
  }
};

// For development/debugging - remove all forum data and start fresh
export const resetForumData = async () => {
  try {
    console.log('WARNING: Resetting all forum data...');
    
    // Delete all comments
    const { error: commentsError } = await supabase
      .from('forum_comments')
      .delete()
      .neq('id', 'placeholder'); // Delete all
    
    if (commentsError) {
      console.error('Error deleting comments:', commentsError);
    }
    
    // Delete all topics
    const { error: topicsError } = await supabase
      .from('forum_topics')
      .delete()
      .neq('id', 'placeholder'); // Delete all
    
    if (topicsError) {
      console.error('Error deleting topics:', topicsError);
    }
    
    // Delete all categories
    const { error: categoriesError } = await supabase
      .from('forum_categories')
      .delete()
      .neq('id', 'placeholder'); // Delete all
    
    if (categoriesError) {
      console.error('Error deleting categories:', categoriesError);
    }
    
    return !commentsError && !topicsError && !categoriesError;
  } catch (error) {
    console.error('Unexpected error resetting forum data:', error);
    return false;
  }
};
