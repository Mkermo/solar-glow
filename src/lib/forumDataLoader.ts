import { supabase } from './supabase';

// Interface definitions
interface Category {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  topic_count?: number;
  recent_topics?: Topic[];
}

interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  category_id: string;
  view_count?: number;
  views?: number; // Alternative column name
  comment_count?: number;
  profiles?: {
    username?: string;
    avatar_url?: string;
    email?: string;
    id?: string;
  };
  forum_categories?: {
    name: string;
    name_ar?: string;
  };
}

interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
  email?: string;
}

// Cache mechanism for performance
const cache = {
  categories: null,
  recentTopics: null,
  popularTopics: null,
  profiles: {},
  commentCounts: {},
  lastFetch: 0,
  initChecked: false
};

// Cache timeout in milliseconds (5 minutes)
const CACHE_TIMEOUT = 5 * 60 * 1000;

// Function to check and initialize required database functions
export async function checkDatabaseFunctions() {
  // Fast path: skip heavy RPC existence checks on client
  if (cache.initChecked) return true;
  cache.initChecked = true;
  return true;
}

// Function to fetch forum categories
export async function fetchForumCategories() {
  // Check cache first
  const now = Date.now();
  if (cache.categories && (now - cache.lastFetch < CACHE_TIMEOUT)) {
    console.log('Using cached categories');
    return cache.categories;
  }
  
  console.log('Fetching forum categories...');
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('name', { ascending: true });
    
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  // Update cache
  cache.categories = data;
  cache.lastFetch = now;
  
  return data;
}

// Function to fetch recent topics
export async function fetchRecentTopics(limit = 10) {
  // Check cache first
  const now = Date.now();
  if (cache.recentTopics && (now - cache.lastFetch < CACHE_TIMEOUT)) {
    console.log('Using cached recent topics');
    return cache.recentTopics;
  }
  
  console.log('Fetching recent topics...');
  const { data, error } = await supabase
    .from('forum_topics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching recent topics:', error);
    throw error;
  }
  
  // Update cache
  cache.recentTopics = data;
  cache.lastFetch = now;
  
  return data;
}

// Function to fetch popular topics
export async function fetchPopularTopics(limit = 10) {
  // Check cache first
  const now = Date.now();
  if (cache.popularTopics && (now - cache.lastFetch < CACHE_TIMEOUT)) {
    console.log('Using cached popular topics');
    return cache.popularTopics;
  }
  
  try {
    // Try view_count first
    let { data, error } = await supabase
      .from('forum_topics')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      // Try views as fallback
      const alt = await supabase
        .from('forum_topics')
        .select('*')
        .order('views', { ascending: false })
        .limit(limit);

      data = alt.data;
      error = alt.error as any;
    }

    if (error) {
      // Final fallback to created_at
      const fb = await supabase
        .from('forum_topics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      cache.popularTopics = fb.data;
      cache.lastFetch = now;
      return fb.data;
    }

    cache.popularTopics = data;
    cache.lastFetch = now;
    return data;
  } catch (err) {
    console.error('Error in fetchPopularTopics:', err);
    const recentTopics = await fetchRecentTopics(limit);
    cache.popularTopics = recentTopics;
    return recentTopics;
  }
}

// Function to fetch topics for a category
export async function fetchTopicsForCategory(categoryId: string, limit = 3) {
  console.log(`Fetching topics for category ${categoryId}...`);
  const { data, error } = await supabase
    .from('forum_topics')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error(`Error fetching topics for category ${categoryId}:`, error);
    return [];
  }
  
  return data || [];
}

// Function to fetch topic count for a category
export async function fetchTopicCountForCategory(categoryId: string) {
  const { count, error } = await supabase
    .from('forum_topics')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId);
    
  if (error) {
    console.error(`Error counting topics for category ${categoryId}:`, error);
    return 0;
  }
  
  return count || 0;
}

// Function to fetch comment count for a topic
export async function fetchCommentCountForTopic(topicId: string) {
  // Check cache first
  if (cache.commentCounts[topicId] !== undefined) {
    return cache.commentCounts[topicId];
  }
  
  const { count, error } = await supabase
    .from('forum_comments')
    .select('*', { count: 'exact', head: true })
    .eq('topic_id', topicId);
    
  if (error) {
    console.error(`Error counting comments for topic ${topicId}:`, error);
    return 0;
  }
  
  // Update cache
  cache.commentCounts[topicId] = count || 0;
  
  return count || 0;
}

// Function to fetch user profiles
export async function fetchUserProfiles(userIds: string[]) {
  // Filter out IDs that are already cached
  const uncachedIds = userIds.filter(id => !cache.profiles[id]);
  
  if (uncachedIds.length === 0) {
    // All profiles are cached
    return userIds.reduce((acc, id) => {
      acc[id] = cache.profiles[id];
      return acc;
    }, {} as Record<string, Profile>);
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, email')
    .in('id', uncachedIds);
    
  if (error) {
    console.error('Error fetching profiles:', error);
    return {};
  }
  
  // Update cache with new profiles
  if (data) {
    data.forEach(profile => {
      cache.profiles[profile.id] = profile;
    });
  }
  
  // Return all requested profiles (both from cache and new)
  return userIds.reduce((acc, id) => {
    acc[id] = cache.profiles[id] || null;
    return acc;
  }, {} as Record<string, Profile | null>);
}

// Function to efficiently load all forum data
export async function loadForumData() {
  console.log('[ForumDataLoader] Starting to load forum data...');
  
  try {
    // Make sure database functions are available
    await checkDatabaseFunctions();
    
    console.log('[ForumDataLoader] Step 1: Fetching basic data in parallel');
    // Step 1: Fetch all basic data in parallel
    const [categories, recentTopics, popularTopics] = await Promise.all([
      fetchForumCategories().catch(err => {
        console.error('[ForumDataLoader] Error fetching categories:', err);
        return [];
      }),
      fetchRecentTopics().catch(err => {
        console.error('[ForumDataLoader] Error fetching recent topics:', err);
        return [];
      }),
      fetchPopularTopics().catch(err => {
        console.error('[ForumDataLoader] Error fetching popular topics:', err);
        return [];
      })
    ]);
    
    console.log('[ForumDataLoader] Basic data fetched successfully');
    
    // Step 2: Extract all category IDs and user IDs
    const categoryIds = categories.map(category => category.id);
    
    const allUserIds = new Set<string>();
    recentTopics.forEach(topic => {
      if (topic.user_id) allUserIds.add(topic.user_id);
    });
    popularTopics.forEach(topic => {
      if (topic.user_id) allUserIds.add(topic.user_id);
    });
    
    // Step 3: Fetch category data (topic counts and recent topics) in parallel
    console.log('[ForumDataLoader] Step 3: Fetching category topic data');
    const categoryTopicPromises = categoryIds.map(async categoryId => {
      try {
        console.log(`[ForumDataLoader] Fetching data for category ${categoryId}`);
        const [topicsData, topicCount] = await Promise.all([
          fetchTopicsForCategory(categoryId, 3).catch(err => {
            console.error(`[ForumDataLoader] Error fetching topics for category ${categoryId}:`, err);
            return [];
          }),
          fetchTopicCountForCategory(categoryId).catch(err => {
            console.error(`[ForumDataLoader] Error counting topics for category ${categoryId}:`, err);
            return 0;
          })
        ]);
        
        // Collect user IDs from category topics
        topicsData.forEach(topic => {
          if (topic.user_id) allUserIds.add(topic.user_id);
        });
        
        return { categoryId, topicsData, topicCount };
      } catch (err) {
        console.error(`[ForumDataLoader] Error processing category ${categoryId}:`, err);
        return { categoryId, topicsData: [], topicCount: 0 };
      }
    });
    
    const categoryTopicsResults = await Promise.all(categoryTopicPromises);
    
    // Step 4: Create a category data map
    const categoryDataMap = categoryTopicsResults.reduce((map, result) => {
      map[result.categoryId] = { 
        topicsData: result.topicsData,
        topicCount: result.topicCount
      };
      return map;
    }, {} as Record<string, { topicsData: Topic[], topicCount: number }>);
    
    // Step 5: Fetch all user profiles in a single batch
    const userIdsArray = Array.from(allUserIds);
    const profileMap = await fetchUserProfiles(userIdsArray);
    
    // Step 6: Collect all topic IDs for comment counts
    const allTopicIds = new Set<string>();
    recentTopics.forEach(topic => allTopicIds.add(topic.id));
    popularTopics.forEach(topic => allTopicIds.add(topic.id));
    categoryTopicsResults.forEach(result => {
      result.topicsData.forEach(topic => allTopicIds.add(topic.id));
    });
    
    // Step 7: Fetch all comment counts in parallel
    const commentCountPromises = Array.from(allTopicIds).map(async topicId => {
      const count = await fetchCommentCountForTopic(topicId);
      return { topicId, count };
    });
    
    const commentCounts = await Promise.all(commentCountPromises);
    
    // Step 8: Create comment count map
    const commentCountMap = commentCounts.reduce((map, result) => {
      map[result.topicId] = result.count;
      return map;
    }, {} as Record<string, number>);
    
    // Step 9: Enhance the data with profiles and comment counts
    
    // Enhance recent topics
    const enhancedRecentTopics = recentTopics.map(topic => ({
      ...topic,
      profiles: profileMap[topic.user_id] || null,
      comment_count: commentCountMap[topic.id] || 0
    }));
    
    // Enhance popular topics
    const enhancedPopularTopics = popularTopics.map(topic => ({
      ...topic,
      profiles: profileMap[topic.user_id] || null,
      comment_count: commentCountMap[topic.id] || 0
    }));
    
    // Enhance categories
    const enhancedCategories = categories.map(category => {
      const categoryData = categoryDataMap[category.id] || { topicCount: 0, topicsData: [] };
      
      // Enhance category topics with profiles and comment counts
      const enhancedTopics = categoryData.topicsData.map(topic => ({
        ...topic,
        profiles: profileMap[topic.user_id] || null,
        comment_count: commentCountMap[topic.id] || 0
      }));
      
      return {
        ...category,
        topic_count: categoryData.topicCount,
        recent_topics: enhancedTopics
      };
    });
    
    // Step 10: Return the final data
    return {
      categories: enhancedCategories,
      recentTopics: enhancedRecentTopics,
      popularTopics: enhancedPopularTopics,
      // Create a map of category topics for easy state updates
      categoryTopics: categoryIds.reduce((map, categoryId) => {
        const data = categoryDataMap[categoryId];
        if (data && data.topicsData.length > 0) {
          map[categoryId] = data.topicsData.map(topic => ({
            ...topic,
            profiles: profileMap[topic.user_id] || null,
            comment_count: commentCountMap[topic.id] || 0
          }));
        }
        return map;
      }, {} as Record<string, Topic[]>)
    };
  } catch (error) {
    console.error('Error in loadForumData:', error);
    throw error;
  }
}

/**
 * Efficiently fetches a category and its topics with optimized queries
 * @param categoryId The ID of the category to fetch
 * @returns The category and its topics
 */
/**
 * Function to diagnose forum data loading issues
 */
export async function diagnoseForumIssues() {
  console.log('[ForumDiagnostics] Starting forum diagnostics...');
  
  try {
    // Check supabase connection
    console.log('[ForumDiagnostics] Testing Supabase connection...');
    const { data, error } = await supabase.from('forum_categories').select('count(*)', { count: 'exact' });
    
    if (error) {
      console.error('[ForumDiagnostics] Supabase connection issue:', error);
      return { success: false, error: 'Connection issue', details: error };
    }
    
    // Check tables and structure
    const tableChecks = await Promise.all([
      checkTable('forum_categories'),
      checkTable('forum_topics'),
      checkTable('forum_comments'),
      checkTable('profiles')
    ]);
    
    return {
      success: true,
      connection: 'OK',
      tables: {
        categories: tableChecks[0],
        topics: tableChecks[1],
        comments: tableChecks[2],
        profiles: tableChecks[3]
      }
    };
  } catch (err) {
    console.error('[ForumDiagnostics] Error during diagnostics:', err);
    return { success: false, error: 'Diagnostic error', details: err };
  }
}

// Helper function to check a table
async function checkTable(tableName: string) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      return { exists: false, error: error.message };
    }
    
    return { exists: true, count };
  } catch (err) {
    return { exists: false, error: 'Error checking table' };
  }
}

export async function fetchCategoryWithTopics(categoryId: string) {
  console.log(`[ForumDataLoader] Fetching category ${categoryId} with topics`);
  try {
    // Execute all queries in parallel
    const [categoryResult, topicsResult] = await Promise.all([
      // Get category details
      supabase
        .from('forum_categories')
        .select('*')
        .eq('id', categoryId)
        .single(),
        
      // Get topics for this category
      supabase
        .from('forum_topics')
        .select('*')
        .eq('category_id', categoryId)
        .order('is_sticky', { ascending: false })
        .order('created_at', { ascending: false })
    ]);
    
    // Check for errors
    if (categoryResult.error) throw categoryResult.error;
    if (topicsResult.error) throw topicsResult.error;
    
    const category = categoryResult.data;
    const topics = topicsResult.data || [];
    
    // If we have topics, get all user IDs and topic IDs
    if (topics.length > 0) {
      const userIds = [...new Set(topics.map(topic => topic.user_id))];
      const topicIds = topics.map(topic => topic.id);
      
      // Fetch profiles and comment counts in parallel
      const [profilesResult, commentCountsPromises] = await Promise.all([
        // Get all profiles in a single query
        supabase
          .from('profiles')
          .select('id, username, avatar_url, email')
          .in('id', userIds),
          
        // Get comment counts for each topic in parallel
        Promise.all(topicIds.map(async topicId => {
          const { count, error } = await supabase
            .from('forum_comments')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topicId);
            
          return { topicId, count: count || 0, error };
        }))
      ]);
      
      // Create lookup maps
      const profileMap = {};
      if (profilesResult.data) {
        profilesResult.data.forEach(profile => {
          profileMap[profile.id] = profile;
        });
      }
      
      const commentCountMap = {};
      commentCountsPromises.forEach(result => {
        commentCountMap[result.topicId] = result.count;
      });
      
      // Enhance topics with profiles and comment counts
      const enhancedTopics = topics.map(topic => ({
        ...topic,
        profiles: profileMap[topic.user_id] || null,
        comment_count: commentCountMap[topic.id] || 0
      }));
      
      return { category, topics: enhancedTopics };
    }
    
    return { category, topics };
  } catch (error) {
    console.error('Error in fetchCategoryWithTopics:', error);
    throw error;
  }
}
