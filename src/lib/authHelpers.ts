import { supabase } from './supabase';

/**
 * Check if the current session has the necessary permissions for a given action
 * This can help diagnose authentication issues before they cause errors
 */
export const checkAuthPermissions = async (table: string, action: 'select' | 'insert' | 'update' | 'delete') => {
  try {
    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    const isLoggedIn = !!sessionData.session;
    
    // Attempt a minimal operation based on the action type
    let result;
    
    switch (action) {
      case 'select':
        result = await supabase.from(table).select('count(*)', { count: 'exact', head: true });
        break;
      case 'insert':
        // Just check if we can access the table, don't actually insert
        result = await supabase.from(table).select('count(*)', { count: 'exact', head: true });
        break;
      case 'update':
        // Just check if we can access the table, don't actually update
        result = await supabase.from(table).select('count(*)', { count: 'exact', head: true });
        break;
      case 'delete':
        // Just check if we can access the table, don't actually delete
        result = await supabase.from(table).select('count(*)', { count: 'exact', head: true });
        break;
      default:
        throw new Error(`Invalid action: ${action}`);
    }
    
    return {
      success: !result.error,
      isLoggedIn,
      error: result.error,
      canAccess: !result.error,
      details: result.error ? result.error.message : 'Access granted'
    };
  } catch (err) {
    return {
      success: false,
      isLoggedIn: false,
      error: err,
      canAccess: false,
      details: err instanceof Error ? err.message : 'Unknown error'
    };
  }
};

/**
 * Get the current user session and access level information
 */
export const getSessionInfo = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        isLoggedIn: false,
        user: null,
        error,
        accessLevel: 'none'
      };
    }
    
    return {
      isLoggedIn: !!data.session,
      user: data.session?.user || null,
      error: null,
      accessLevel: data.session?.user?.role || 'anon'
    };
  } catch (err) {
    return {
      isLoggedIn: false,
      user: null,
      error: err,
      accessLevel: 'none'
    };
  }
};
