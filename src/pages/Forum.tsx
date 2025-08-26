import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, PlusCircle, Calendar, Clock, User, FileText } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import TopicListItem from "@/components/forum/TopicListItem";

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
  comment_count?: number;
  profiles?: {
    username?: string;
    avatar_url?: string;
    email?: string;
  };
  forum_categories?: {
    name: string;
    name_ar?: string;
  };
}

const Forum = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentTopics, setRecentTopics] = useState<Topic[]>([]);
  const [popularTopics, setPopularTopics] = useState<Topic[]>([]);
  const [categoryTopics, setCategoryTopics] = useState<{[key: string]: Topic[]}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForumData() {
      setLoading(true);
      try {
        console.log('Fetching forum data...');
        
        // Import and use the schema adapter
        const { adaptToDatabaseSchema } = await import('@/lib/schemaAdapter');
        let schemaInfo;
        
        try {
          schemaInfo = await adaptToDatabaseSchema();
          console.log('Schema adaptation result:', schemaInfo);
        } catch (err) {
          console.error('Error in schema adaptation:', err);
          schemaInfo = {
            success: true, // Assume success even on error
            viewCountField: 'view_count', // Default
            commentTable: 'forum_comments', // Default
            tables: {
              categories: { exists: true },
              topics: { exists: true },
              comments: { exists: true }
            }
          };
        }
        
        if (!schemaInfo.success) {
          console.error('Forum tables are not properly set up. Please go to the Forum Debug page to fix this issue.');
          // Continue anyway with defaults
        }
        
        // Check for any categories
        const { count: categoryCount, error: countError } = await supabase
          .from('forum_categories')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error('Error checking category count:', countError);
        } else {
          console.log(`Found ${categoryCount} categories`);
        }
        
        // Fetch categories with debug logging
        console.log('Attempting to fetch forum categories...');
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('forum_categories')
          .select('*')
          .order('name', { ascending: true });

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          throw categoriesError;
        }
        
        console.log('Categories fetched:', categoriesData);
        console.log('Categories count:', categoriesData?.length || 0);
        
        // Debug - check if we actually have categories but something is wrong with displaying them
        if (categoriesData && categoriesData.length > 0) {
          console.log('First category details:', categoriesData[0]);
        } else {
          console.warn('No categories found in the database. You may need to create some categories first.');
        }
        
        // Use the correct view count column name from schema adaptation
        const viewCountColumn = schemaInfo.viewCountField;
        
        // Fetch recent topics without filtering by is_approved initially to see all topics
        // Use a simpler query that's less likely to fail
        const { data: recentTopicsData, error: recentTopicsError } = await supabase
          .from('forum_topics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentTopicsError) {
          console.error('Error fetching recent topics:', recentTopicsError);
          throw recentTopicsError;
        }
        
        // Separately fetch the category data
        if (recentTopicsData && recentTopicsData.length > 0) {
          // Get unique category IDs
          const categoryIds = [...new Set(recentTopicsData.map(topic => topic.category_id))];
          
          // Fetch categories in a separate query
          const { data: topicCategories, error: catError } = await supabase
            .from('forum_categories')
            .select('id, name, name_ar')
            .in('id', categoryIds);
            
          if (!catError && topicCategories) {
            // Create a map for quick lookup
            const categoryMap = topicCategories.reduce((map, cat) => {
              map[cat.id] = cat;
              return map;
            }, {});
            
            // Merge the data
            recentTopicsData.forEach(topic => {
              topic.forum_categories = categoryMap[topic.category_id];
            });
          }
        }
        
        console.log('Recent topics fetched:', recentTopicsData);
        
        // Fetch popular topics (by view count) - using the view count column from schema adapter
        console.log(`Using ${viewCountColumn} column for sorting by popularity`);
        
        // Try to fetch popular topics, but handle errors gracefully
        let popularTopicsData = [];
        try {
          // First try with the detected column
          const { data, error } = await supabase
            .from('forum_topics')
            .select('*')
            .order(viewCountColumn, { ascending: false })
            .limit(10);
            
          if (error) {
            console.error(`Error using ${viewCountColumn} column:`, error);
            
            // Try the alternative column
            const altColumn = viewCountColumn === 'view_count' ? 'views' : 'view_count';
            console.log(`Trying alternate column ${altColumn}`);
            
            const { data: altData, error: altError } = await supabase
              .from('forum_topics')
              .select('*')
              .order(altColumn, { ascending: false })
              .limit(10);
              
            if (!altError) {
              popularTopicsData = altData;
              console.log(`Successfully used ${altColumn} instead`);
            } else {
              // If both fail, just sort by created_at as a fallback
              console.log(`Both columns failed, using created_at as fallback`);
              const { data: fallbackData } = await supabase
                .from('forum_topics')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);
                
              popularTopicsData = fallbackData || [];
            }
          } else {
            popularTopicsData = data;
          }
        } catch (err) {
          console.error('Exception fetching popular topics:', err);
          // Use empty array if all attempts fail
          popularTopicsData = [];
        }
        
        // Separately fetch category data for popular topics
        if (popularTopicsData && popularTopicsData.length > 0) {
          // Get unique category IDs
          const categoryIds = [...new Set(popularTopicsData.map(topic => topic.category_id))];
          
          // Fetch categories in a separate query
          const { data: topicCategories, error: catError } = await supabase
            .from('forum_categories')
            .select('id, name, name_ar')
            .in('id', categoryIds);
            
          if (!catError && topicCategories) {
            // Create a map for quick lookup
            const categoryMap = topicCategories.reduce((map, cat) => {
              map[cat.id] = cat;
              return map;
            }, {});
            
            // Merge the data
            popularTopicsData.forEach(topic => {
              topic.forum_categories = categoryMap[topic.category_id];
            });
          }
        }
        
        // For each popular topic, fetch comment/reply counts using the correct table
        const commentTable = schemaInfo.commentTable;
        console.log(`Using ${commentTable} for comment counts`);
        
        const enhancedPopularTopics = await Promise.all(popularTopicsData?.map(async (topic) => {
          const { count: commentCount, error: countError } = await supabase
            .from(commentTable)
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);
            
          if (countError) {
            console.error(`Error counting comments for topic ${topic.id}:`, countError);
          }
          
          return {
            ...topic,
            comment_count: commentCount || 0
          };
        }) || []);
        
        // Process the data
        const enhancedCategories = await Promise.all(categoriesData?.map(async (category) => {
          // Get topic count for each category
          const { count: topicCount, error: countError } = await supabase
            .from('forum_topics')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
            
          if (countError) {
            console.error(`Error counting topics for category ${category.id}:`, countError);
          }
          
          // Get recent topics for this category - without using joins
          let categoryRecentTopics = [];
          try {
            // First get basic topic data
            const { data: topicsData, error: topicsError } = await supabase
              .from('forum_topics')
              .select('*')
              .eq('category_id', category.id)
              .eq('is_approved', true)
              .order('created_at', { ascending: false })
              .limit(3);
              
            if (topicsError) {
              console.error(`Error fetching topics for category ${category.id}:`, topicsError);
            } else if (topicsData && topicsData.length > 0) {
              // Get all user IDs from topics
              const userIds = [...new Set(topicsData.map(topic => topic.user_id))];
              
              // Fetch profiles separately - one by one to avoid the .in() syntax which might be causing errors
              let profiles = [];
              for (const userId of userIds) {
                try {
                  const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, email')
                    .eq('id', userId)
                    .single();
                    
                  if (profile) {
                    profiles.push(profile);
                  }
                } catch (err) {
                  console.log(`Could not fetch profile for user ${userId}`, err);
                }
              }
                
              // Create profile lookup map
              const profileMap = {};
              if (profiles) {
                profiles.forEach(profile => {
                  profileMap[profile.id] = profile;
                });
              }
              
              // Add profiles to topics
              categoryRecentTopics = topicsData.map(topic => ({
                ...topic,
                profiles: profileMap[topic.user_id] || null
              }));
            }
          } catch (error) {
            console.error(`Error fetching topics for category ${category.id}:`, error);
          }
          
          // Store category topics
          if (categoryRecentTopics && categoryRecentTopics.length > 0) {
            setCategoryTopics(prev => ({
              ...prev,
              [category.id]: categoryRecentTopics
            }));
          }
          
          return {
            ...category,
            topic_count: topicCount || 0,
            recent_topics: categoryRecentTopics || []
          };
        }) || []);
        
        // Also get comment counts for recent topics
        const enhancedRecentTopics = await Promise.all(recentTopicsData?.map(async (topic) => {
          const { count: commentCount, error: countError } = await supabase
            .from('forum_comments')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);
            
          if (countError) {
            console.error(`Error counting comments for recent topic ${topic.id}:`, countError);
          }
          
          return {
            ...topic,
            comment_count: commentCount || 0
          };
        }) || []);
        
        console.log('Enhanced categories before setting state:', enhancedCategories);
        console.log('Enhanced categories length:', enhancedCategories?.length || 0);
        
        if (enhancedCategories && enhancedCategories.length > 0) {
          // Force render with timeout to ensure state update
          setTimeout(() => {
            setCategories(enhancedCategories);
          }, 0);
        } else {
          // Fallback to original categories data if enhancement failed
          setCategories(categoriesData || []);
        }
        
        setRecentTopics(enhancedRecentTopics || []);
        setPopularTopics(enhancedPopularTopics || []);
        
        // Debug log state after setting
        setTimeout(() => {
          console.log('Categories state after setting:', categories);
          console.log('Categories state length:', categories?.length || 0);
        }, 500);
        
      } catch (error) {
        console.error('Error fetching forum data:', error);
        // Even if there's an error, let's try to show at least the categories
        try {
          const { data: categoriesData } = await supabase
            .from('forum_categories')
            .select('*')
            .order('name', { ascending: true });
          
          if (categoriesData && categoriesData.length > 0) {
            setCategories(categoriesData);
          }
        } catch (err) {
          console.error('Failed to recover with categories-only query:', err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchForumData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="container py-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      <ScrollReveal initiallyVisible={true}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t("Community Forum", "منتدى المجتمع")}</h1>
            <Link to="/forum/debug" className="text-sm text-muted-foreground hover:underline">
              {t("Forum Diagnostics", "تشخيص المنتدى")}
            </Link>
          </div>
          {user && (
            <Button asChild>
              <Link to="/forum/new-topic">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("New Topic", "موضوع جديد")}
              </Link>
            </Button>
          )}
        </div>
      </ScrollReveal>

      {/* Forum description */}
      <ScrollReveal delay={0.1}>
        <div className="bg-muted p-4 rounded-lg mb-8">
          <p>
            {t(
              "Welcome to our Solar Energy Community Forum. Share knowledge, ask questions, and connect with other solar enthusiasts.",
              "مرحبًا بك في منتدى مجتمع الطاقة الشمسية. شارك المعرفة، واطرح الأسئلة، وتواصل مع المهتمين الآخرين بالطاقة الشمسية."
            )}
          </p>
          {!user && (
            <p className="mt-2">
              {t(
                "Please sign in to create new topics or reply to discussions.",
                "يرجى تسجيل الدخول لإنشاء مواضيع جديدة أو الرد على المناقشات."
              )}
            </p>
          )}
        </div>
      </ScrollReveal>
      
      {/* Forum Tabs */}
      <Tabs defaultValue="categories" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">{t("Categories", "الفئات")}</TabsTrigger>
          <TabsTrigger value="recent">{t("Recent Discussions", "المناقشات الأخيرة")}</TabsTrigger>
          <TabsTrigger value="popular">{t("Popular Topics", "المواضيع الشائعة")}</TabsTrigger>
        </TabsList>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4">{t("Loading forum content...", "جاري تحميل محتوى المنتدى...")}</p>
          </div>
        ) : (
          <>
            {/* Categories Tab */}
            <TabsContent value="categories">
              {categories.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <MessageSquare className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">{t("No Categories Found", "لم يتم العثور على فئات")}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t(
                      "There are no categories available. You may need to set up the forum first.",
                      "لا توجد فئات متاحة. قد تحتاج إلى إعداد المنتدى أولاً."
                    )}
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/forum/debug">
                      {t("Go to Forum Debug", "الذهاب إلى صفحة تشخيص المنتدى")}
                    </Link>
                  </Button>
                  
                  {user && (
                    <Button 
                      variant="default" 
                      className="ml-4"
                      onClick={async () => {
                        try {
                          const { data, error } = await supabase
                            .from('forum_categories')
                            .insert({
                              name: 'Test Category',
                              name_ar: 'فئة اختبار',
                              description: 'A test category created directly from the forum page',
                              description_ar: 'فئة اختبار تم إنشاؤها مباشرة من صفحة المنتدى'
                            })
                            .select();
                            
                          if (error) {
                            console.error('Error creating test category:', error);
                            alert(`Error creating test category: ${error.message}`);
                          } else {
                            console.log('Test category created:', data);
                            alert('Test category created successfully! Please refresh the page.');
                            window.location.reload();
                          }
                        } catch (err) {
                          console.error('Exception creating test category:', err);
                          alert(`Exception creating test category: ${String(err)}`);
                        }
                      }}
                    >
                      {t("Create Test Category", "إنشاء فئة اختبار")}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {categories.map((category, index) => (
                    <ScrollReveal key={category.id} direction="up" delay={0.1 + index * 0.05}>
                      <Card>
                        <CardHeader>
                          <Link to={`/forum/category/${category.id}`} className="hover:text-primary transition-colors">
                            <CardTitle>
                              <div className="flex items-center">
                                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                                {lang === 'ar' && category.name_ar ? category.name_ar : category.name}
                                <Badge variant="outline" className="ml-2">
                                  {category.topic_count} {t("topics", "مواضيع")}
                                </Badge>
                              </div>
                            </CardTitle>
                          </Link>
                          <CardDescription>
                            {lang === 'ar' && category.description_ar ? category.description_ar : category.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          {category.recent_topics && category.recent_topics.length > 0 ? (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium mb-2">{t("Recent Topics", "المواضيع الأخيرة")}:</h4>
                              <div className="divide-y border rounded-md overflow-hidden">
                                {category.recent_topics.map(topic => (
                                  <Link 
                                    key={topic.id} 
                                    to={`/forum/topic/${topic.id}`}
                                    className="block p-3 hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="font-medium">{topic.title}</div>
                                  </Link>
                                ))}
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/forum/category/${category.id}`}>
                                  {t("View All Topics", "عرض جميع المواضيع")} →
                                </Link>
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center p-4 border rounded-md">
                              <p className="text-muted-foreground text-sm">
                                {t("No topics in this category yet.", "لا توجد مواضيع في هذه الفئة حتى الآن.")}
                              </p>
                              {user && (
                                <Button variant="outline" size="sm" className="mt-2" asChild>
                                  <Link to={`/forum/new-topic/${category.id}`}>
                                    <PlusCircle className="h-4 w-4 mr-1" />
                                    {t("Create First Topic", "إنشاء أول موضوع")}
                                  </Link>
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Recent Discussions Tab */}
            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    {t("Recently Posted Topics", "المواضيع المنشورة مؤخرا")}
                  </CardTitle>
                  <CardDescription>
                    {t("The latest discussions from our community", "أحدث المناقشات من مجتمعنا")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentTopics.length === 0 ? (
                    <div className="text-center py-10">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p>{t("No topics have been created yet.", "لم يتم إنشاء أي مواضيع حتى الآن.")}</p>
                    </div>
                  ) : (
                    <div className="divide-y border rounded-lg overflow-hidden">
                      {recentTopics.map((topic, index) => (
                        <ScrollReveal key={topic.id} direction="up" delay={0.1 + index * 0.05}>
                          <TopicListItem topic={topic} />
                        </ScrollReveal>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Popular Topics Tab */}
            <TabsContent value="popular">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    {t("Popular Topics", "المواضيع الشائعة")}
                  </CardTitle>
                  <CardDescription>
                    {t("Most viewed discussions in our community", "المناقشات الأكثر مشاهدة في مجتمعنا")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {popularTopics.length === 0 ? (
                    <div className="text-center py-10">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p>{t("No topics have been created yet.", "لم يتم إنشاء أي مواضيع حتى الآن.")}</p>
                    </div>
                  ) : (
                    <div className="divide-y border rounded-lg overflow-hidden">
                      {popularTopics.map((topic, index) => (
                        <ScrollReveal key={topic.id} direction="up" delay={0.1 + index * 0.05}>
                          <TopicListItem topic={topic} />
                        </ScrollReveal>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Forum;