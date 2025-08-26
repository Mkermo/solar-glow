import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { 
  createTestCategoryIfNeeded, 
  createTestTopic,
  tableExists,
  getForumTablesStatus
} from "@/lib/schemaAdapter";

interface TableInfo {
  exists: boolean;
  count: number | null;
  error?: string;
}

const ForumDebug = () => {
  const [tables, setTables] = useState<Record<string, TableInfo>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("check");
  const { user } = useAuth();

  useEffect(() => {
    checkTables();
  }, []);

  const checkTables = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const tableNames = ["forum_categories", "forum_topics", "forum_comments"];
      const results: Record<string, TableInfo> = {};
      
      for (const tableName of tableNames) {
        try {
          // Check if table exists
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
            
          results[tableName] = {
            exists: !error,
            count,
            error: error ? error.message : undefined
          };
          
          console.log(`Table ${tableName} check:`, results[tableName]);
        } catch (err) {
          results[tableName] = {
            exists: false,
            count: null,
            error: err instanceof Error ? err.message : "Unknown error"
          };
        }
      }
      
      setTables(results);
    } catch (err) {
      setMessage(`Error checking tables: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setMessage("Running diagnostics...");
    
    try {
      // 1. Check if the tables exist and have correct columns
      const { data: categoriesColumns, error: categoriesError } = await supabase
        .rpc('get_table_columns', { table_name: 'forum_categories' });
      
      const { data: topicsColumns, error: topicsError } = await supabase
        .rpc('get_table_columns', { table_name: 'forum_topics' });
      
      const { data: commentsColumns, error: commentsError } = await supabase
        .rpc('get_table_columns', { table_name: 'forum_comments' });
        
      if (categoriesError || topicsError || commentsError) {
        console.log("Column check errors:", { categoriesError, topicsError, commentsError });
        setMessage("Unable to check table columns. Try running the SQL script in Supabase SQL Editor.");
      } else {
        console.log("Columns found:", {
          categories: categoriesColumns,
          topics: topicsColumns,
          comments: commentsColumns
        });
        
        // Check for view_count column
        const hasViewCount = topicsColumns?.some((col: any) => col.column_name === 'view_count');
        if (!hasViewCount) {
          setMessage("Missing view_count column in forum_topics table. Please run the SQL setup script.");
        } else {
          setMessage("All tables and columns appear to be set up correctly!");
        }
      }
    } catch (err) {
      setMessage(`Diagnostics error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForumData = async () => {
    if (!confirm("WARNING: This will delete ALL forum data! Are you sure?")) {
      return;
    }
    
    setLoading(true);
    setMessage("Resetting forum data...");
    
    try {
      // Delete comments first (due to foreign key constraints)
      await supabase
        .from('forum_comments')
        .delete()
        .not('id', 'is', null);
        
      // Delete topics next
      await supabase
        .from('forum_topics')
        .delete()
        .not('id', 'is', null);
        
      // Delete categories last
      await supabase
        .from('forum_categories')
        .delete()
        .not('id', 'is', null);
        
      setMessage("Forum data reset successfully. Please restart the app to create test data.");
      
      // Refresh table info
      await checkTables();
    } catch (err) {
      setMessage(`Reset error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestCategory = async () => {
    if (!user) {
      setMessage("You must be logged in to create a test category");
      return;
    }
    
    setLoading(true);
    setMessage("Creating test category...");
    
    try {
      // Check if forum_categories table exists
      const categoryTableExists = await tableExists('forum_categories');
      if (!categoryTableExists) {
        setMessage("The forum_categories table doesn't exist. Please run the SQL setup script first.");
        return;
      }
      
      // Create a test category
      const { data, error } = await supabase
        .from('forum_categories')
        .insert({
          name: 'Test Category',
          name_ar: 'فئة اختبار',
          description: 'A test category for the forum',
          description_ar: 'فئة اختبار للمنتدى'
        })
        .select();
        
      if (error) {
        console.error('Error creating test category:', error);
        setMessage(`Failed to create test category: ${error.message}`);
        return;
      }
      
      if (data && data.length > 0) {
        setMessage(`Test category created successfully! Category ID: ${data[0].id}`);
      } else {
        setMessage("Category created but no data returned");
      }
      
      // Refresh table info
      await checkTables();
    } catch (err) {
      setMessage(`Error creating test category: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    if (!user) {
      setMessage("You must be logged in to create test data");
      return;
    }
    
    setLoading(true);
    setMessage("Creating test data...");
    
    try {
      // First check if tables exist, create test category if needed
      const tablesStatus = await getForumTablesStatus();
      if (!tablesStatus.forum_categories || !tablesStatus.forum_topics) {
        setMessage("Please run the SQL setup script first");
        return;
      }
      
      // Create test category if needed
      const categoryId = await createTestCategoryIfNeeded();
      if (!categoryId) {
        setMessage("Failed to get or create a test category");
        return;
      }
      
      // Create test topic
      const topicId = await createTestTopic(categoryId, user.id);
      if (!topicId) {
        setMessage("Failed to create test topic");
        return;
      }
      
      setMessage(`Test data created successfully! Topic ID: ${topicId}`);
      
      // Refresh table info
      await checkTables();
    } catch (err) {
      setMessage(`Error creating test data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Forum Debug Page</h1>
      
      {message && (
        <Alert className="mb-6">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="check" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="check">Check Tables</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="test">Test Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="check">
          <Card>
            <CardHeader>
              <CardTitle>Table Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6 flex-wrap">
                <Button onClick={checkTables} disabled={loading}>
                  {loading ? "Checking..." : "Check Tables"}
                </Button>
                <Button onClick={runDiagnostics} disabled={loading} variant="outline">
                  Run Diagnostics
                </Button>
              </div>
              
              {Object.entries(tables).map(([table, info]) => (
                <div key={table} className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{table}</h3>
                    {info.exists ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        Exists
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        Missing
                      </Badge>
                    )}
                  </div>
                  
                  {info.exists ? (
                    <p className="text-sm text-muted-foreground">
                      {info.count !== null ? `Contains ${info.count} records` : "Count unavailable"}
                    </p>
                  ) : (
                    <p className="text-sm text-red-500">
                      {info.error || "Table doesn't exist. Please run the SQL setup script."}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="setup">
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-lg font-semibold mb-2">SQL Scripts</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Step 1: Setup Tables</h4>
              <p className="mb-4">Copy and run the following SQL in the Supabase SQL Editor to create forum tables:</p>
              <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs overflow-auto max-h-48">
{`-- Create forum_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_topics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  is_sticky BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for proper security
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY IF NOT EXISTS "Allow public read access to forum_categories" 
  ON public.forum_categories FOR SELECT USING (true);
  
CREATE POLICY IF NOT EXISTS "Allow public read access to forum_topics" 
  ON public.forum_topics FOR SELECT USING (true);
  
CREATE POLICY IF NOT EXISTS "Allow public read access to forum_comments" 
  ON public.forum_comments FOR SELECT USING (true);

-- Allow authenticated users to create content
CREATE POLICY IF NOT EXISTS "Allow authenticated users to create topics" 
  ON public.forum_topics FOR INSERT TO authenticated USING (true);
  
CREATE POLICY IF NOT EXISTS "Allow authenticated users to create comments" 
  ON public.forum_comments FOR INSERT TO authenticated USING (true);`}
              </pre>
              <Button variant="outline" className="mt-2" onClick={() => {
                navigator.clipboard.writeText(document.querySelectorAll("pre")[0]?.textContent || "");
                alert("Setup SQL copied to clipboard!");
              }}>
                Copy Setup SQL
              </Button>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Step 2: Fix Existing Tables</h4>
              <p className="mb-4">If you're seeing errors about missing columns, run this SQL to fix existing tables:</p>
              <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs overflow-auto max-h-48">
{`-- Fix forum_categories table
DO $$ 
BEGIN 
  -- Add name_ar column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_categories' 
    AND column_name = 'name_ar'
  ) THEN
    ALTER TABLE public.forum_categories ADD COLUMN name_ar TEXT;
    RAISE NOTICE 'Added name_ar column to forum_categories';
  END IF;
  
  -- Add description_ar column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_categories' 
    AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE public.forum_categories ADD COLUMN description_ar TEXT;
    RAISE NOTICE 'Added description_ar column to forum_categories';
  END IF;
END $$;

-- Fix forum_topics table
DO $$
BEGIN
  -- If table has views column but not view_count column, rename it
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'views'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'view_count'
  ) THEN
    ALTER TABLE public.forum_topics RENAME COLUMN views TO view_count;
    RAISE NOTICE 'Renamed views column to view_count in forum_topics';
  END IF;
  
  -- If there's no view_count column, add it
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_topics' 
    AND column_name = 'view_count'
  ) THEN
    ALTER TABLE public.forum_topics ADD COLUMN view_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added view_count column to forum_topics';
  END IF;
END $$;`}
              </pre>
              <Button variant="outline" className="mt-2" onClick={() => {
                navigator.clipboard.writeText(document.querySelectorAll("pre")[1]?.textContent || "");
                alert("Fix SQL copied to clipboard!");
              }}>
                Copy Fix SQL
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Button onClick={createTestCategory} disabled={loading || !user}>
                    Create Test Category Only
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Creates only a test category (useful if the forum page shows empty categories)
                  </p>
                </div>

                <div>
                  <Button onClick={createTestData} disabled={loading || !user}>
                    Create Test Data
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Creates a test category and topic to verify forum functionality
                  </p>
                </div>
                
                <div>
                  <Button onClick={resetForumData} disabled={loading} variant="destructive">
                    Reset Forum Data
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    WARNING: This will delete ALL forum data!
                  </p>
                </div>
                
                <div>
                  <Button 
                    onClick={async () => {
                      if (!confirm("Create sample forum data?")) return;
                      
                      setLoading(true);
                      setMessage("Creating sample data...");
                      
                      try {
                        // First check if we have categories
                        const { count: catCount } = await supabase
                          .from('forum_categories')
                          .select('*', { count: 'exact', head: true });
                          
                        // Create categories if none exist
                        if (!catCount || catCount === 0) {
                          const categories = [
                            { name: "General Discussion", name_ar: "مناقشة عامة", description: "General discussions about solar energy" },
                            { name: "Product Questions", name_ar: "أسئلة المنتج", description: "Questions about our products" },
                            { name: "Technical Support", name_ar: "الدعم الفني", description: "Get help with technical issues" }
                          ];
                          
                          const { data: createdCats, error: catError } = await supabase
                            .from('forum_categories')
                            .insert(categories)
                            .select();
                            
                          if (catError) {
                            throw new Error(`Error creating categories: ${catError.message}`);
                          }
                          
                          setMessage(`Created ${createdCats.length} categories`);
                          
                          // Get current user
                          const { data: { user } } = await supabase.auth.getUser();
                          
                          if (user) {
                            // Create some topics
                            const topics = createdCats.map((cat) => ({
                              title: `Sample topic in ${cat.name}`,
                              content: `This is a sample topic created for testing purposes in the ${cat.name} category.`,
                              user_id: user.id,
                              category_id: cat.id,
                              is_approved: true
                            }));
                            
                            const { error: topicError } = await supabase
                              .from('forum_topics')
                              .insert(topics);
                              
                            if (topicError) {
                              throw new Error(`Error creating topics: ${topicError.message}`);
                            }
                            
                            setMessage("Sample forum data created successfully");
                          } else {
                            setMessage("Created categories, but no user found to create topics");
                          }
                        } else {
                          setMessage("Categories already exist, skipping sample data creation");
                        }
                      } catch (err) {
                        setMessage(`Error creating sample data: ${err instanceof Error ? err.message : String(err)}`);
                      } finally {
                        setLoading(false);
                        checkTables();
                      }
                    }}
                    disabled={loading}>
                    Create Sample Data
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Creates multiple categories and topics for a more complete forum experience
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForumDebug;
