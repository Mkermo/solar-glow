import { supabase } from './supabase';

export async function diagnoseForumIssues() {
  try {
    console.log('Running forum diagnostics...');
    
    // Check if tables exist
    const tables = ['forum_categories', 'forum_topics', 'forum_comments', 'profiles'];
    const tableResults = {};
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      tableResults[table] = {
        exists: !error,
        count: count || 0,
        error: error?.message
      };
    }
    
    // Check sample data
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('*')
      .limit(3);
    
    const { data: categories, error: categoriesError } = await supabase
      .from('forum_categories')
      .select('*')
      .limit(3);
    
    // Check database functions
    const functionResults = {};
    try {
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_table_columns', { table_name: 'forum_topics' });
      
      functionResults.get_table_columns = {
        exists: !functionError,
        error: functionError?.message
      };
    } catch (err) {
      functionResults.get_table_columns = {
        exists: false,
        error: 'Function call failed'
      };
    }
    
    try {
      const { error: profilesError } = await supabase
        .rpc('create_missing_profiles');
      
      functionResults.create_missing_profiles = {
        exists: !profilesError || !profilesError.message.includes('does not exist'),
        error: profilesError?.message
      };
    } catch (err) {
      functionResults.create_missing_profiles = {
        exists: false,
        error: 'Function call failed'
      };
    }
    
    // Return diagnostic results
    return {
      tables: tableResults,
      sampleData: {
        topics: {
          data: topics,
          error: topicsError?.message
        },
        categories: {
          data: categories,
          error: categoriesError?.message
        }
      },
      functions: functionResults
    };
  } catch (error) {
    console.error('Error in diagnoseForumIssues:', error);
    return { error: error.message };
  }
}
