import { supabase } from './supabase';

// Function to increment view count for a topic
export const incrementTopicViewCount = async (topicId: string) => {
  if (!topicId) return;
  
  try {
    console.log(`Incrementing view count for topic ${topicId}`);
    
    // First check if view_count column exists, otherwise use views
    const { data: columnCheck, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'forum_topics' })
      .select();
      
    const viewCountColumn = columnCheck?.some((col: any) => col.column_name === 'view_count')
      ? 'view_count'
      : 'views';
    
    console.log(`Using ${viewCountColumn} column for view counts`);
    
    // Get the current view count
    const { data: topic, error: fetchError } = await supabase
      .from('forum_topics')
      .select(viewCountColumn)
      .eq('id', topicId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching topic view count:', fetchError);
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
