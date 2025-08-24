import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, PlusCircle, Filter } from "lucide-react";

const Forum = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForumData() {
      setLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('forum_categories')
          .select('*')
          .order('name', { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch recent topics
        const { data: topicsData, error: topicsError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            forum_categories(name, name_ar),
            profiles(username, avatar_url)
          `)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (topicsError) throw topicsError;
        setTopics(topicsData || []);
      } catch (error) {
        console.error('Error fetching forum data:', error);
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
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("Community Forum", "منتدى المجتمع")}</h1>
        {user && (
          <Button asChild>
            <Link to="/forum/new-topic">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("New Topic", "موضوع جديد")}
            </Link>
          </Button>
        )}
      </div>

      {/* Forum description */}
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

      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">{t("Categories", "الفئات")}</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/forum/category/${category.id}`}
                className="flex items-center p-4 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {lang === 'ar' && category.name_ar ? category.name_ar : category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'ar' && category.description_ar ? category.description_ar : category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Topics */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t("Recent Discussions", "المناقشات الأخيرة")}</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p>{t("No topics have been created yet.", "لم يتم إنشاء أي مواضيع حتى الآن.")}</p>
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
                      <span className="mx-2">•</span>
                      <span>
                        {lang === 'ar' && topic.forum_categories?.name_ar
                          ? topic.forum_categories.name_ar
                          : topic.forum_categories?.name}
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
    </div>
  );
};

export default Forum;