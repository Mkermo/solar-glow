import { useState, FormEvent, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Send, Loader2 } from "lucide-react";

const NewTopic = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { t } = useLanguage();
  const { user, loading } = useAuth(); 
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || '');
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(!categoryId);

  // Use useEffect for authentication check
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: t("Authentication Required", "مطلوب تسجيل الدخول"),
        description: t("Please login to create a topic.", "يرجى تسجيل الدخول لإنشاء موضوع."),
        variant: "destructive"
      });
      navigate('/login', { state: { from: categoryId ? `/forum/new-topic/${categoryId}` : '/forum/new-topic' } });
    }
  }, [user, loading, navigate, categoryId, t]);

  // Fetch categories if no categoryId is provided
  useEffect(() => {
    if (!categoryId) {
      const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
          const { data, error } = await supabase
            .from('forum_categories')
            .select('id, name')
            .order('name');
            
          if (error) {
            console.error('Error fetching categories:', error);
            toast({
              title: t("Error", "خطأ"),
              description: t("Failed to load categories", "فشل في تحميل الفئات"),
              variant: "destructive"
            });
          } else if (data?.length) {
            setCategories(data);
            setSelectedCategory(data[0].id);
            console.log("Categories loaded:", data);
          } else {
            console.log("No categories found");
          }
        } catch (err) {
          console.error("Error in fetchCategories:", err);
        } finally {
          setCategoriesLoading(false);
        }
      };
      
      fetchCategories();
    }
  }, [categoryId, t, toast]);

  // Show loading state
  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full" />
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: t("Missing information", "معلومات ناقصة"),
        description: t("Please fill in both title and content fields.", "يرجى ملء حقلي العنوان والمحتوى."),
        variant: "destructive"
      });
      return;
    }
    
    // Check if category is selected when no categoryId is provided
    const effectiveCategoryId = categoryId || selectedCategory;
    if (!effectiveCategoryId) {
      toast({
        title: t("Missing category", "الفئة مفقودة"),
        description: t("Please select a category for your topic.", "يرجى اختيار فئة لموضوعك."),
        variant: "destructive"
      });
      return;
    }

    // Check if user is still authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      toast({
        title: t("Authentication Error", "خطأ في المصادقة"),
        description: t("Please login again to continue.", "يرجى تسجيل الدخول مرة أخرى للمتابعة."),
        variant: "destructive"
      });
      navigate('/login', { state: { from: categoryId ? `/forum/new-topic/${categoryId}` : '/forum/new-topic' } });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          title: title.trim(),
          content: content.trim(),
          user_id: session.user.id,
          category_id: effectiveCategoryId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(t(
          "Failed to create topic. Please try again.",
          "فشل في إنشاء الموضوع. يرجى المحاولة مرة أخرى."
        ));
      }
      
      toast({
        title: t("Topic created", "تم إنشاء الموضوع"),
        description: t("Your topic has been posted successfully.", "تم نشر موضوعك بنجاح."),
      });
      
      // Redirect to the new topic
      if (data) {
        navigate(`/forum/topic/${data.id}`);
      } else {
        const effectiveCategoryId = categoryId || selectedCategory;
        if (effectiveCategoryId) {
          navigate(`/forum/category/${effectiveCategoryId}`);
        } else {
          navigate('/forum');
        }
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      toast({
        title: t("Error", "خطأ"),
        description: error instanceof Error ? error.message : t(
          "An unexpected error occurred.",
          "حدث خطأ غير متوقع."
        ),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link to={categoryId ? `/forum/category/${categoryId}` : '/forum'}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {categoryId 
            ? t("Back to Category", "العودة إلى الفئة") 
            : t("Back to Forum", "العودة إلى المنتدى")}
        </Link>
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">{t("Create New Topic", "إنشاء موضوع جديد")}</h1>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{t("Topic Details", "تفاصيل الموضوع")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category dropdown when no category is provided in URL */}
            {!categoryId && (
              <div className="space-y-2">
                <Label htmlFor="category">{t("Category", "الفئة")}</Label>
                {categoriesLoading ? (
                  <div className="flex h-10 items-center">
                    <div className="animate-spin h-5 w-5 border-b-2 border-gray-900 rounded-full mr-2"></div>
                    {t("Loading categories...", "جار تحميل الفئات...")}
                  </div>
                ) : categories.length > 0 ? (
                  <select
                    id="category"
                    name="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={isSubmitting}
                    required
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 border border-yellow-300 bg-yellow-50 text-yellow-700 rounded-md">
                    {t("No categories available. Please create a category first.", "لا توجد فئات متاحة. يرجى إنشاء فئة أولاً.")}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">{t("Title", "العنوان")}</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("Enter topic title...", "أدخل عنوان الموضوع...")}
                disabled={isSubmitting}
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">{t("Content", "المحتوى")}</Label>
              <Textarea
                id="content"
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("Write your topic content here...", "اكتب محتوى موضوعك هنا...")}
                disabled={isSubmitting}
                rows={10}
                className="resize-y"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (categoryId) {
                  navigate(`/forum/category/${categoryId}`);
                } else {
                  navigate('/forum');
                }
              }}
              disabled={isSubmitting}
            >
              {t("Cancel", "إلغاء")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Creating...", "جاري الإنشاء...")}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t("Create Topic", "إنشاء موضوع")}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewTopic;
