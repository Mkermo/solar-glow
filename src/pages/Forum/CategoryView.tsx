
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, AlertCircle, Clock, ChevronLeft, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import TopicListItem from "@/components/forum/TopicListItem";

interface Topic {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_sticky: boolean;
  is_locked: boolean;
  view_count: number;
  comment_count?: number;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

const CategoryView = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryAndTopics = async () => {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('id', categoryId)
          .single();
          
        if (categoryError) throw categoryError;
        setCategory(categoryData);
        
        // Fetch topics for this category with user profiles
        const { data: topicsData, error: topicsError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profiles:user_id (username, avatar_url, email)
          `)
          .eq('category_id', categoryId)
          .order('is_sticky', { ascending: false })
          .order('created_at', { ascending: false });
          
        if (topicsError) throw topicsError;
        
        // For each topic, count the number of comments
        const topicsWithCommentCounts = await Promise.all(topicsData.map(async (topic) => {
          const { count, error: countError } = await supabase
            .from('forum_comments')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);
            
          if (countError) throw countError;
          
          return {
            ...topic,
            comment_count: count || 0
          };
        }));
        
        setTopics(topicsWithCommentCounts);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndTopics();
  }, [categoryId]);

  const handleNewTopic = () => {
    if (!user) {
      navigate('/login', { state: { from: `/forum/category/${categoryId}` } });
    } else {
      navigate(`/forum/new-topic/${categoryId}`);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted/50 rounded w-1/3"></div>
          <div className="h-6 bg-muted/50 rounded w-1/2"></div>
          <div className="space-y-4 mt-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || t("Category not found", "الفئة غير موجودة")}
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link to="/forum">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("Back to Forum", "العودة إلى المنتدى")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" asChild className="mb-2">
            <Link to="/forum">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("Back to Forum", "العودة إلى المنتدى")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && <p className="text-muted-foreground">{category.description}</p>}
        </div>
        <Button onClick={handleNewTopic}>
          <Plus className="mr-2 h-4 w-4" />
          {t("New Topic", "موضوع جديد")}
        </Button>
      </div>

      {topics.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">
              {t("No topics yet", "لا توجد مواضيع بعد")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t(
                "Be the first to start a discussion in this category!",
                "كن أول من يبدأ المناقشة في هذه الفئة!"
              )}
            </p>
            <Button onClick={handleNewTopic}>
              <Plus className="mr-2 h-4 w-4" />
              {t("Create Topic", "إنشاء موضوع")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {topics.map((topic) => (
                <div key={topic.id} className={topic.is_sticky ? "bg-primary/5" : ""}>
                  <TopicListItem 
                    topic={{
                      ...topic,
                      forum_categories: { name: category.name }
                    }}
                    showCategory={false}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoryView;
