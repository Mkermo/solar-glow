import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, PlusCircle, ChevronLeft } from "lucide-react";

const ForumCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [category, setCategory] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategoryData() {
      setLoading(true);
      try {
        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('id', categoryId)
          .single();

        if (categoryError) throw categoryError;
        setCategory(categoryData);

        // Fetch topics in this category
        const { data: topicsData, error: topicsError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profiles(username, avatar_url)
          `)
          .eq('category_id', categoryId)
          // Removed filter on is_approved as it doesn't exist in the schema
          .order('created_at', { ascending: false });

        if (topicsError) throw topicsError;
        setTopics(topicsData || []);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("Category Not Found", "الفئة غير موجودة")}</h1>
        <Button asChild>
          <Link to="/forum">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("Back to Forum", "العودة إلى المنتدى")}
          </Link>
        </Button>
      </div>
    );
  }

  const categoryName = lang === 'ar' && category.name_ar ? category.name_ar : category.name;
  const categoryDescription = lang === 'ar' && category.description_ar ? category.description_ar : category.description;

  return (
    <div className="container py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/forum">
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("Back to Forum", "العودة إلى المنتدى")}
        </Link>
      </Button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{categoryName}</h1>
          {categoryDescription && <p className="text-muted-foreground mt-2">{categoryDescription}</p>}
        </div>
        
        {user && (
          <Button asChild>
            <Link to={`/forum/new-topic/${categoryId}`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("New Topic", "موضوع جديد")}
            </Link>
          </Button>
        )}
      </div>

      {/* Topics list */}
      {topics.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p>{t("No topics have been created in this category yet.", "لم يتم إنشاء أي مواضيع في هذه الفئة حتى الآن.")}</p>
          {user && (
            <Button asChild className="mt-4">
              <Link to={`/forum/new-topic/${categoryId}`}>
                {t("Create the first topic", "إنشاء أول موضوع")}
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="divide-y">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                to={`/forum/topic/${topic.id}`}
                className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{topic.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span>
                      {t("by", "بواسطة")} {topic.profiles?.username || t("Unknown", "غير معروف")}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(topic.created_at)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumCategory;