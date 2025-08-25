
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ScrollReveal from "@/components/ScrollReveal";

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  topic_count?: number;
}

const ForumIndex = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('forum_categories')
          .select('*')
          .order('created_at', { ascending: true });
          
        if (categoriesError) throw categoriesError;
        
        // For each category, count the number of topics
        const categoriesWithCounts = await Promise.all(categoriesData.map(async (category) => {
          const { count, error: countError } = await supabase
            .from('forum_topics')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
            
          if (countError) throw countError;
          
          return {
            ...category,
            topic_count: count || 0
          };
        }));
        
        setCategories(categoriesWithCounts);
      } catch (err) {
        console.error('Error fetching forum data:', err);
        setError('Failed to load forum categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container py-8">
      <ScrollReveal initiallyVisible={true}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t("Community Forum", "منتدى المجتمع")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Join discussions about solar energy solutions and share your experiences.",
              "انضم إلى المناقشات حول حلول الطاقة الشمسية وشارك تجاربك."
            )}
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </ScrollReveal>

      {loading ? (
        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="bg-muted/50 h-24"></CardHeader>
                <CardContent className="h-16 mt-4"></CardContent>
              </Card>
            ))}
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <ScrollReveal key={category.id} direction="up" delay={0.1 + index * 0.05}>
              <Link to={`/forum/category/${category.id}`}>
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center pt-0">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>
                        {t(
                          `${category.topic_count} ${category.topic_count === 1 ? 'topic' : 'topics'}`,
                          `${category.topic_count} ${category.topic_count === 1 ? 'موضوع' : 'مواضيع'}`
                        )}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      {t("Browse", "تصفح")} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumIndex;
