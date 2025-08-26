import { supabase } from './supabase';

/**
 * Helper function to adapt to different database schemas
 * This is useful when working with different versions of the database
 */
export async function adaptToDatabaseSchema() {
  const tables = {
    categories: { exists: false, columns: {} },
    topics: { exists: false, columns: {} },
    comments: { exists: false, columns: {} },
    replies: { exists: false, columns: {} }
  };
  
  try {
    // Check forum_categories table
    const { error: categoriesError } = await supabase
      .from('forum_categories')
      .select('*', { count: 'exact', head: true });
      
    tables.categories.exists = !categoriesError;
    
    if (!categoriesError) {
      try {
        const { data: columns } = await supabase
          .rpc('get_table_columns', { table_name: 'forum_categories' });
          
        if (columns) {
          columns.forEach((col: any) => {
            tables.categories.columns[col.column_name] = col.data_type;
          });
        }
      } catch (err) {
        console.log('Could not check forum_categories columns');
      }
    }
    
    // Check forum_topics table
    const { error: topicsError } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true });
      
    tables.topics.exists = !topicsError;
    
    if (!topicsError) {
      try {
        const { data: columns } = await supabase
          .rpc('get_table_columns', { table_name: 'forum_topics' });
          
        if (columns) {
          columns.forEach((col: any) => {
            tables.topics.columns[col.column_name] = col.data_type;
          });
        }
      } catch (err) {
        console.log('Could not check forum_topics columns');
      }
    }
    
    // Check forum_comments table
    const { error: commentsError } = await supabase
      .from('forum_comments')
      .select('*', { count: 'exact', head: true });
      
    tables.comments.exists = !commentsError;
    
    if (!commentsError) {
      try {
        const { data: columns } = await supabase
          .rpc('get_table_columns', { table_name: 'forum_comments' });
          
        if (columns) {
          columns.forEach((col: any) => {
            tables.comments.columns[col.column_name] = col.data_type;
          });
        }
      } catch (err) {
        console.log('Could not check forum_comments columns');
      }
    }
    
    // Check forum_replies table (alternative to forum_comments)
    const { error: repliesError } = await supabase
      .from('forum_replies')
      .select('*', { count: 'exact', head: true });
      
    tables.replies.exists = !repliesError;
    
    // Check if view_count or views column exists in forum_topics
    let viewColumn = 'view_count'; // Default to view_count
    
    // Try to directly check which column exists
    try {
      const { data: viewTest, error: viewError } = await supabase
        .from('forum_topics')
        .select('view_count')
        .limit(1);
        
      if (viewError) {
        // view_count doesn't exist, try views
        const { error: viewsError } = await supabase
          .from('forum_topics')
          .select('views')
          .limit(1);
          
        if (!viewsError) {
          viewColumn = 'views';
        }
      }
    } catch (err) {
      console.log('Error checking view columns:', err);
    }
    
    console.log(`Using ${viewColumn} as the view count column`);
    
    return {
      tables,
      viewCountField: viewColumn,
      commentTable: tables.comments.exists ? 'forum_comments' : 'forum_replies',
      success: tables.categories.exists && tables.topics.exists && (tables.comments.exists || tables.replies.exists)
    };
  } catch (err) {
    console.error('Error in adaptToDatabaseSchema:', err);
    return {
      tables,
      viewCountField: 'view_count', // default
      commentTable: 'forum_comments', // default
      success: false
    };
  }
}

/**
 * Checks if a column exists in a table
 * @param tableName The name of the table to check
 * @param columnName The name of the column to check for
 * @returns Promise<boolean> True if the column exists, false otherwise
 */
export async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName);
      
    if (error) {
      console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (err) {
    console.error(`Exception checking if column ${columnName} exists in ${tableName}:`, err);
    return false;
  }
}

/**
 * Gets the appropriate column name to use for view count (could be 'view_count' or 'views')
 * @returns Promise<string> The name of the column to use
 */
export async function getViewCountColumnName(): Promise<string> {
  const hasViewCount = await columnExists('forum_topics', 'view_count');
  if (hasViewCount) return 'view_count';
  
  const hasViews = await columnExists('forum_topics', 'views');
  if (hasViews) return 'views';
  
  // Default to view_count
  return 'view_count';
}

/**
 * Checks if a table exists in the database
 * @param tableName The name of the table to check
 * @returns Promise<boolean> True if the table exists, false otherwise
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', tableName);
      
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (err) {
    console.error(`Exception checking if table ${tableName} exists:`, err);
    return false;
  }
}

/**
 * Gets all forum tables status
 * @returns Promise<{[tableName: string]: boolean}> Object with table names and existence status
 */
export async function getForumTablesStatus(): Promise<{[tableName: string]: boolean}> {
  const tables = ['forum_categories', 'forum_topics', 'forum_comments'];
  const result: {[tableName: string]: boolean} = {};
  
  for (const table of tables) {
    result[table] = await tableExists(table);
  }
  
  return result;
}

/**
 * Creates a test category if none exist
 * @returns Promise<string|null> The ID of the created category or null if creation failed
 */
export async function createTestCategoryIfNeeded(): Promise<string|null> {
  try {
    // Check if any categories exist
    const { count } = await supabase
      .from('forum_categories')
      .select('*', { count: 'exact', head: true });
      
    if (count && count > 0) {
      // Categories already exist, get the first one
      const { data } = await supabase
        .from('forum_categories')
        .select('id')
        .limit(1);
        
      return data && data[0]?.id || null;
    }
    
    // No categories exist, create a test one
    const { data, error } = await supabase
      .from('forum_categories')
      .insert({
        name: 'General Discussion',
        description: 'General discussion about anything related to solar energy'
      })
      .select('id');
      
    if (error) {
      console.error('Error creating test category:', error);
      return null;
    }
    
    return data && data[0]?.id || null;
  } catch (err) {
    console.error('Exception creating test category:', err);
    return null;
  }
}

/**
 * Creates a test topic in the specified category
 * @param categoryId The ID of the category to create the topic in
 * @param userId The ID of the user creating the topic
 * @returns Promise<string|null> The ID of the created topic or null if creation failed
 */
export async function createTestTopic(categoryId: string, userId: string): Promise<string|null> {
  try {
    const { data, error } = await supabase
      .from('forum_topics')
      .insert({
        title: 'Test Topic',
        content: 'This is a test topic created to verify forum functionality.',
        category_id: categoryId,
        user_id: userId,
        is_approved: true
      })
      .select('id');
      
    if (error) {
      console.error('Error creating test topic:', error);
      return null;
    }
    
    return data && data[0]?.id || null;
  } catch (err) {
    console.error('Exception creating test topic:', err);
    return null;
  }
}
