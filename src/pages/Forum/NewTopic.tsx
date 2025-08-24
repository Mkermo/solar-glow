import { useState, FormEvent, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  const { user, loading } = useAuth(); // Add loading state
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use useEffect for authentication check
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: t("Authentication Required", "مطلوب تسجيل الدخول"),
        description: t("Please login to create a topic.", "يرجى تسجيل الدخول لإنشاء موضوع."),

        variant: "destructive"
      });
      navigate('/login', { state: { from: `/forum/new-topic/${categoryId}` } });
    }
  }, [user, loading, navigate, categoryId, t]);

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

    // Check if user is still authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      toast({
        title: t("Authentication Error", "خطأ في المصادقة"),
        description: t("Please login again to continue.", "يرجى تسجيل الدخول مرة أخرى للمتابعة."),
        variant: "destructive"
      });
      navigate('/login', { state: { from: `/forum/new-topic/${categoryId}` } });
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
          category_id: categoryId,
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
        navigate(`/forum/category/${categoryId}`);
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
        <Link to={`/forum/category/${categoryId}`}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("Back to Category", "العودة إلى الفئة")}
        </Link>
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">{t("Create New Topic", "إنشاء موضوع جديد")}</h1>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{t("Topic Details", "تفاصيل الموضوع")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              onClick={() => navigate(`/forum/category/${categoryId}`)}
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
