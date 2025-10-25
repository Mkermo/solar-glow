import { supabase } from './supabase';
const canBootstrapForumDb = import.meta.env.VITE_ENABLE_SUPABASE_BOOTSTRAP === 'true';

// Function to check if SQL functions are available
export async function checkForumDbSetup() {
  if (!canBootstrapForumDb) {
    const message = 'Forum DB bootstrap skipped on client (requires elevated Supabase key).';
    console.info(message);
    return { success: true, skipped: true, message };
  }

  try {
    // Check if create_missing_profiles function exists by trying to call it
    const { error: profileError } = await supabase.rpc('create_missing_profiles');
    
    if (profileError && profileError.message.includes('does not exist')) {
      console.log('create_missing_profiles function does not exist, setting up forum functions...');
      return setupForumFunctions();
    }
    
    // Check if get_table_columns function exists
    const { error: columnError } = await supabase.rpc('get_table_columns', { table_name: 'forum_topics' });
    
    if (columnError && columnError.message.includes('does not exist')) {
      console.log('get_table_columns function does not exist, setting up forum functions...');
      return setupForumFunctions();
    }
    
    return { success: true, message: 'Forum functions already set up' };
  } catch (error) {
    console.error('Error checking forum DB setup:', error);
    return { success: false, error };
  }
}

// Function to set up necessary database functions
async function setupForumFunctions() {
  try {
    // 1. Set up get_table_columns function
    const getTableColumnsQuery = `
      CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
      RETURNS TABLE (
        column_name text,
        data_type text,
        is_nullable boolean
      ) LANGUAGE plpgsql SECURITY DEFINER AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          c.column_name::text,
          c.data_type::text,
          (c.is_nullable = 'YES')::boolean
        FROM 
          information_schema.columns c
        WHERE 
          c.table_schema = 'public'
          AND c.table_name = get_table_columns.table_name;
      END;
      $$;
    `;

    // 2. Set up create_missing_profiles function
    const createMissingProfilesQuery = `
      CREATE OR REPLACE FUNCTION create_missing_profiles()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      DECLARE
        topic_user_id UUID;
        user_exists BOOLEAN;
        missing_profiles_count INT := 0;
      BEGIN
        -- Get all distinct user IDs from forum_topics that might need profiles
        FOR topic_user_id IN 
          SELECT DISTINCT user_id 
          FROM forum_topics
        LOOP
          -- Check if the user has a profile
          SELECT EXISTS(
            SELECT 1 FROM profiles WHERE id = topic_user_id
          ) INTO user_exists;
          
          -- If no profile exists, create one
          IF NOT user_exists THEN
            INSERT INTO profiles (
              id, 
              username, 
              updated_at
            ) VALUES (
              topic_user_id,
              'User_' || SUBSTRING(topic_user_id::text, 1, 6),
              NOW()
            );
            missing_profiles_count := missing_profiles_count + 1;
          END IF;
        END LOOP;
      END $$;
    `;

    // 3. Set up sync_forum_view_counts function
    const syncViewCountsQuery = `
      CREATE OR REPLACE FUNCTION sync_forum_view_counts()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        -- Make sure view_count column exists
        BEGIN
          -- Try updating view_count from views
          UPDATE forum_topics 
          SET view_count = views
          WHERE view_count IS NULL OR view_count != views;
        EXCEPTION 
          WHEN undefined_column THEN
            -- Add view_count column if it doesn't exist
            ALTER TABLE public.forum_topics ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
        END;
      
        -- Make sure views column exists
        BEGIN
          -- Try updating views from view_count
          UPDATE forum_topics 
          SET views = view_count
          WHERE views IS NULL OR views != view_count;
        EXCEPTION 
          WHEN undefined_column THEN
            -- Add views column if it doesn't exist
            ALTER TABLE public.forum_topics ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
        END;
      END $$;
    `;

    // Execute the SQL to create functions
    const { error: errorColumns } = await supabase.rpc('exec_sql', { sql: getTableColumnsQuery });
    const { error: errorProfiles } = await supabase.rpc('exec_sql', { sql: createMissingProfilesQuery });
    const { error: errorViewCounts } = await supabase.rpc('exec_sql', { sql: syncViewCountsQuery });
    
    if (errorColumns || errorProfiles || errorViewCounts) {
      // If direct function creation fails, try creating a utility function first
      const createExecSqlFunction = `
        CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      // Try to create the utility function
      const { error: execSqlError } = await supabase.rpc('exec_sql', { sql: createExecSqlFunction });
      
      if (execSqlError) {
        console.error('Failed to create exec_sql function:', execSqlError);
        return { 
          success: false, 
          message: 'Could not create database functions. Please run the SQL scripts manually.',
          error: execSqlError
        };
      }
      
      // Try again after creating exec_sql
      const retryResult = await setupForumFunctions();
      return retryResult;
    }
    
    return { success: true, message: 'Forum functions set up successfully' };
  } catch (error) {
    console.error('Error setting up forum functions:', error);
    return { 
      success: false, 
      message: 'Error setting up forum functions. Please run the SQL scripts manually.',
      error
    };
  }
}

export async function ensureForumDbSetup() {
  // Call this function on app startup to ensure DB is ready for forum
  const result = await checkForumDbSetup();
  console.log('Forum DB setup result:', result);
  return result;
}
