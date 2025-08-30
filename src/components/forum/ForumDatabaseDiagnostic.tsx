import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { ensureForumDbSetup } from "@/lib/forumDbSetup";

const ForumDatabaseDiagnostic = () => {
  const [results, setResults] = useState({
    topics: { count: 0, data: [], error: null, loading: true },
    categories: { count: 0, data: [], error: null, loading: true },
    profiles: { count: 0, data: [], error: null, loading: true },
  });

  const checkTopics = async () => {
    setResults(prev => ({
      ...prev,
      topics: { ...prev.topics, loading: true, error: null }
    }));
    
    try {
      // Basic count check
      const { count: topicCount, error: countError } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Get sample data
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .limit(5);
        
      if (error) throw error;
      
      setResults(prev => ({
        ...prev,
        topics: {
          count: topicCount,
          data: data || [],
          error: null,
          loading: false
        }
      }));
    } catch (err) {
      console.error('Error checking topics:', err);
      setResults(prev => ({
        ...prev,
        topics: {
          ...prev.topics,
          error: err.message,
          loading: false
        }
      }));
    }
  };
  
  const checkCategories = async () => {
    setResults(prev => ({
      ...prev,
      categories: { ...prev.categories, loading: true, error: null }
    }));
    
    try {
      // Basic count check
      const { count, error: countError } = await supabase
        .from('forum_categories')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Get sample data
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .limit(5);
        
      if (error) throw error;
      
      setResults(prev => ({
        ...prev,
        categories: {
          count,
          data: data || [],
          error: null,
          loading: false
        }
      }));
    } catch (err) {
      console.error('Error checking categories:', err);
      setResults(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          error: err.message,
          loading: false
        }
      }));
    }
  };
  
  const checkProfiles = async () => {
    setResults(prev => ({
      ...prev,
      profiles: { ...prev.profiles, loading: true, error: null }
    }));
    
    try {
      // Basic count check
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Get sample data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
        
      if (error) throw error;
      
      setResults(prev => ({
        ...prev,
        profiles: {
          count,
          data: data || [],
          error: null,
          loading: false
        }
      }));
    } catch (err) {
      console.error('Error checking profiles:', err);
      setResults(prev => ({
        ...prev,
        profiles: {
          ...prev.profiles,
          error: err.message,
          loading: false
        }
      }));
    }
  };
  
  const runAllChecks = () => {
    checkTopics();
    checkCategories();
    checkProfiles();
  };
  
  useEffect(() => {
    runAllChecks();
  }, []);
  
  const tryToFixIssues = async () => {
    try {
      // 1. Make sure all necessary database functions are set up
      const dbSetupResult = await ensureForumDbSetup();
      if (!dbSetupResult.success) {
        console.error('Error setting up forum database functions:', dbSetupResult.error);
      }
      
      // 2. Make sure profiles exist for all topic authors
      const { error: profileError } = await supabase.rpc('create_missing_profiles', {});
      
      if (profileError) {
        console.error('Error creating missing profiles:', profileError);
        
        // Direct SQL approach for creating profiles if RPC fails
        await supabase.from('profiles').upsert([
          {
            id: '00000000-0000-0000-0000-000000000000',
            username: 'system',
            email: 'system@example.com'
          }
        ]);
      }
      
      // 2. Fix any NULL user_ids or category_ids in topics
      const { data: firstUser } = await supabase.from('auth.users').select('id').limit(1).single();
      const { data: firstCategory } = await supabase.from('forum_categories').select('id').limit(1).single();
      
      if (firstUser && firstCategory) {
        await supabase
          .from('forum_topics')
          .update({ user_id: firstUser.id })
          .is('user_id', null);
          
        await supabase
          .from('forum_topics')
          .update({ category_id: firstCategory.id })
          .is('category_id', null);
      }
      
      // 3. Refresh data
      runAllChecks();
      
    } catch (err) {
      console.error('Error fixing issues:', err);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forum Database Diagnostic</h1>
        <Button onClick={runAllChecks}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh All
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Topics Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              Forum Topics
              <span className="text-lg font-normal">{results.topics.count}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.topics.loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : results.topics.error ? (
              <div className="p-3 bg-red-50 text-red-700 rounded flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{results.topics.error}</span>
              </div>
            ) : results.topics.data.length > 0 ? (
              <ul className="space-y-2 mt-2">
                {results.topics.data.map(topic => (
                  <li key={topic.id} className="p-2 border rounded text-sm">
                    <div className="font-medium">{topic.title}</div>
                    <div className="text-xs text-gray-500">
                      ID: {topic.id.substring(0, 8)}... | User: {topic.user_id?.substring(0, 8)}...
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-muted-foreground">No topics found</p>
            )}
          </CardContent>
        </Card>
        
        {/* Categories Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              Categories
              <span className="text-lg font-normal">{results.categories.count}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.categories.loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : results.categories.error ? (
              <div className="p-3 bg-red-50 text-red-700 rounded flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{results.categories.error}</span>
              </div>
            ) : results.categories.data.length > 0 ? (
              <ul className="space-y-2 mt-2">
                {results.categories.data.map(category => (
                  <li key={category.id} className="p-2 border rounded text-sm">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-gray-500">
                      ID: {category.id.substring(0, 8)}...
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-muted-foreground">No categories found</p>
            )}
          </CardContent>
        </Card>
        
        {/* Profiles Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              User Profiles
              <span className="text-lg font-normal">{results.profiles.count}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.profiles.loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : results.profiles.error ? (
              <div className="p-3 bg-red-50 text-red-700 rounded flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{results.profiles.error}</span>
              </div>
            ) : results.profiles.data.length > 0 ? (
              <ul className="space-y-2 mt-2">
                {results.profiles.data.map(profile => (
                  <li key={profile.id} className="p-2 border rounded text-sm">
                    <div className="font-medium">{profile.username || profile.email || 'Unknown User'}</div>
                    <div className="text-xs text-gray-500">
                      ID: {profile.id.substring(0, 8)}...
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-muted-foreground">No profiles found</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Database Status:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>
                  Topics: {results.topics.error ? (
                    <span className="text-red-500">Error: {results.topics.error}</span>
                  ) : (
                    <span className="text-green-600">OK ({results.topics.count} found)</span>
                  )}
                </li>
                <li>
                  Categories: {results.categories.error ? (
                    <span className="text-red-500">Error: {results.categories.error}</span>
                  ) : (
                    <span className="text-green-600">OK ({results.categories.count} found)</span>
                  )}
                </li>
                <li>
                  Profiles: {results.profiles.error ? (
                    <span className="text-red-500">Error: {results.profiles.error}</span>
                  ) : (
                    <span className="text-green-600">OK ({results.profiles.count} found)</span>
                  )}
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Relationship Status:</h3>
              {results.topics.data.length > 0 && (
                <ul className="list-disc ml-6 space-y-1">
                  {results.topics.data.map(topic => {
                    const hasValidUserId = results.profiles.data.some(p => p.id === topic.user_id);
                    const hasValidCategoryId = results.categories.data.some(c => c.id === topic.category_id);
                    
                    return (
                      <li key={topic.id} className="text-sm">
                        Topic "{topic.title}": 
                        {hasValidUserId ? (
                          <span className="text-green-600 ml-1">Valid user</span>
                        ) : (
                          <span className="text-red-500 ml-1">Missing user profile!</span>
                        )}
                        {hasValidCategoryId ? (
                          <span className="text-green-600 ml-1">Valid category</span>
                        ) : (
                          <span className="text-red-500 ml-1">Missing category!</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Actions:</h3>
              <Button onClick={tryToFixIssues}>
                Attempt Auto-Fix
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This will attempt to fix common issues like missing profiles and NULL references.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForumDatabaseDiagnostic;
